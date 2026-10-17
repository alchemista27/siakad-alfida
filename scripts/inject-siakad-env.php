<?php
// Script to inject encrypted environment variables into Coolify container for Application ID 8 (SIAKAD)
// This script runs inside the Coolify container where Laravel kernel and App\Models\EnvironmentVariable are loaded.

if (file_exists('/var/www/html/vendor/autoload.php')) {
    require_once '/var/www/html/vendor/autoload.php';
    $app = require_once '/var/www/html/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
} elseif (file_exists(__DIR__.'/vendor/autoload.php')) {
    require_once __DIR__.'/vendor/autoload.php';
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
}

$input = file_get_contents('php://stdin');
$envData = json_decode($input, true);
if (!$envData) {
    fwrite(STDERR, "Error: Invalid JSON input\n");
    exit(1);
}

$appId = 8;
$count = 0;

foreach ($envData as $key => $value) {
    foreach ([false, true] as $isPreview) {
        $existing = App\Models\EnvironmentVariable::where('resourceable_type', 'App\Models\Application')
            ->where('resourceable_id', $appId)
            ->where('key', $key)
            ->where('is_preview', $isPreview)
            ->first();

        if ($existing) {
            $existing->value = $value;
            $existing->is_buildtime = true;
            $existing->save();
        } else {
            App\Models\EnvironmentVariable::create([
                'resourceable_type' => 'App\Models\Application',
                'resourceable_id' => $appId,
                'key' => $key,
                'value' => $value,
                'is_buildtime' => true,
                'is_preview' => $isPreview,
                'is_multiline' => false,
            ]);
        }
        $count++;
    }
}
echo "Environment variables successfully injected for App ID {$appId} (Total records upserted: {$count})\n";
