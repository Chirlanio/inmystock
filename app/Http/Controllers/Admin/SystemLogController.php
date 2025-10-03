<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class SystemLogController extends Controller
{
    /**
     * Display a listing of system logs.
     */
    public function index(Request $request): Response
    {
        $logPath = storage_path('logs');
        $logFiles = [];

        if (File::exists($logPath)) {
            $files = File::files($logPath);

            foreach ($files as $file) {
                if ($file->getExtension() === 'log') {
                    $logFiles[] = [
                        'name' => $file->getFilename(),
                        'path' => $file->getPathname(),
                        'size' => $this->formatBytes($file->getSize()),
                        'size_bytes' => $file->getSize(),
                        'modified' => $file->getMTime(),
                        'modified_formatted' => date('d/m/Y H:i:s', $file->getMTime()),
                    ];
                }
            }

            // Sort by modification time (newest first)
            usort($logFiles, function ($a, $b) {
                return $b['modified'] - $a['modified'];
            });
        }

        $selectedFile = $request->get('file');
        $logContent = null;
        $logEntries = [];

        if ($selectedFile) {
            $filePath = storage_path('logs/' . basename($selectedFile));

            if (File::exists($filePath)) {
                $logContent = File::get($filePath);
                $logEntries = $this->parseLogFile($logContent);

                // Apply filters
                if ($request->has('level')) {
                    $level = strtoupper($request->get('level'));
                    $logEntries = array_filter($logEntries, function ($entry) use ($level) {
                        return $entry['level'] === $level;
                    });
                }

                if ($request->has('search')) {
                    $search = strtolower($request->get('search'));
                    $logEntries = array_filter($logEntries, function ($entry) use ($search) {
                        return str_contains(strtolower($entry['message']), $search) ||
                               str_contains(strtolower($entry['context']), $search);
                    });
                }

                // Paginate entries
                $perPage = 50;
                $page = $request->get('page', 1);
                $total = count($logEntries);
                $logEntries = array_slice($logEntries, ($page - 1) * $perPage, $perPage);

                $pagination = [
                    'current_page' => (int) $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => (int) ceil($total / $perPage),
                ];
            }
        }

        return Inertia::render('admin/logs/index', [
            'logFiles' => $logFiles,
            'selectedFile' => $selectedFile,
            'logEntries' => array_values($logEntries),
            'pagination' => $pagination ?? null,
            'filters' => $request->only(['level', 'search']),
        ]);
    }

    /**
     * Parse log file content into structured entries.
     */
    private function parseLogFile(string $content): array
    {
        $entries = [];
        $lines = explode("\n", $content);
        $currentEntry = null;

        foreach ($lines as $line) {
            // Check if line starts a new log entry
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)$/', $line, $matches)) {
                if ($currentEntry) {
                    $entries[] = $currentEntry;
                }

                $currentEntry = [
                    'timestamp' => $matches[1],
                    'environment' => $matches[2],
                    'level' => $matches[3],
                    'message' => $matches[4],
                    'context' => '',
                ];
            } elseif ($currentEntry && trim($line)) {
                // Continuation of previous entry (stack trace, context, etc.)
                $currentEntry['context'] .= $line . "\n";
            }
        }

        if ($currentEntry) {
            $entries[] = $currentEntry;
        }

        return array_reverse($entries); // Show newest first
    }

    /**
     * Download a log file.
     */
    public function download(Request $request)
    {
        $file = $request->get('file');
        $filePath = storage_path('logs/' . basename($file));

        if (!File::exists($filePath)) {
            return back()->with('error', 'Arquivo de log não encontrado.');
        }

        return response()->download($filePath);
    }

    /**
     * Delete a log file.
     */
    public function delete(Request $request)
    {
        $file = $request->get('file');
        $filePath = storage_path('logs/' . basename($file));

        if (!File::exists($filePath)) {
            return back()->with('error', 'Arquivo de log não encontrado.');
        }

        // Don't allow deleting current day's log
        if (str_contains($file, date('Y-m-d'))) {
            return back()->with('error', 'Não é possível excluir o log do dia atual.');
        }

        File::delete($filePath);

        return back()->with('success', 'Arquivo de log excluído com sucesso.');
    }

    /**
     * Clear a log file.
     */
    public function clear(Request $request)
    {
        $file = $request->get('file');
        $filePath = storage_path('logs/' . basename($file));

        if (!File::exists($filePath)) {
            return back()->with('error', 'Arquivo de log não encontrado.');
        }

        File::put($filePath, '');

        return back()->with('success', 'Arquivo de log limpo com sucesso.');
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
