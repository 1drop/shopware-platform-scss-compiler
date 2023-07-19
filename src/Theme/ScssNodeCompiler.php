<?php

namespace Onedrop\Scss\Theme;

use Shopware\Storefront\Theme\AbstractCompilerConfiguration;
use Shopware\Storefront\Theme\AbstractScssCompiler;
use Symfony\Component\Process\Process;

class ScssNodeCompiler extends AbstractScssCompiler
{


    public function __construct(private AbstractScssCompiler $decorated)
    {
    }

    public function compileString(AbstractCompilerConfiguration $config, string $scss, ?string $path = null): string
    {
        $nodeVersion = $this->checkNodeVersion();
        $npmVersion = $this->checkNpmVersion();
        if (!$nodeVersion || !$npmVersion) {
            return $this->decorated->compileString($config, $scss, $path);
        }
        $this->installNodeModules();
        // TODO: consider importPaths
        $css = $this->compileWithWebpack($scss);
        return $css;
    }

    public function filesHandledInternal(): bool
    {
        return false;
    }

    private function checkNodeVersion(): ?string
    {
        $process = new Process(['node', '--version']);
        $process->run();
        if ($process->getExitCode() !== 0) {
            return null;
        }
        return trim($process->getOutput());
    }

    private function checkNpmVersion(): ?string
    {
        $process = new Process(['npm', '--version']);
        $process->run();
        if ($process->getExitCode() !== 0) {
            return null;
        }
        return trim($process->getOutput());
    }

    private function installNodeModules(): bool
    {
        if (is_dir(__DIR__ . '/../Resources/build/node_modules')) {
            return true;
        }
        $process = (new Process(['npm', 'install'], __DIR__ . '/../Resources/build'))->mustRun();
        return $process->getExitCode() === 0;
    }

    private function compileWithWebpack(string $scss): string
    {
        $buildDir = __DIR__ . '/../Resources/build/tmp';
        if (!is_dir($buildDir)) {
            mkdir($buildDir, 0777, true);
        }
        file_put_contents($buildDir . '/style.scss', $scss);
        (new Process(['npm', 'run', 'build'], __DIR__ . '/../Resources/build'))->mustRun();
        return file_get_contents($buildDir . '/dist/style.css');
    }


}
