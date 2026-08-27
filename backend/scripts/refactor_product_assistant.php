<?php

declare(strict_types=1);

$source = __DIR__ . '/../app/Services/AI/ProductAssistantService.php';

if (!is_file($source)) {
    fwrite(STDERR, "Source file not found: {$source}\n");
    exit(1);
}

$code = file_get_contents($source);

if ($code === false) {
    fwrite(STDERR, "Unable to read source file.\n");
    exit(1);
}

/*
 * We intentionally use the actual PHP method declaration pattern.
 *
 * This is an inspection tool only.
 * It does NOT modify ProductAssistantService.php.
 */
$pattern = '/
    ^[ \t]*
    (?:
        public|protected|private
    )
    (?:[ \t]+static)?
    [ \t]+function[ \t]+
    ([A-Za-z_][A-Za-z0-9_]*)
    [ \t]*\(
/mx';

preg_match_all($pattern, $code, $matches);

$methods = $matches[1] ?? [];

echo "Detected methods:\n";

foreach ($methods as $method) {
    echo " - {$method}\n";
}

echo "\nTotal: " . count($methods) . "\n";
