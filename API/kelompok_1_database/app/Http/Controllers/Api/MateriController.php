<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MateriRequest;
use App\Models\Jadwal;
use App\Models\MateriPertemuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MateriController extends Controller
{
    /**
     * List semua materi dari satu jadwal (16 pertemuan).
     */
    public function index($jadwalId)
    {
        $jadwal = Jadwal::findOrFail($jadwalId);
        $this->authorizeDosen($jadwal);

        $materi = MateriPertemuan::where('jadwal_id', $jadwalId)
            ->orderBy('pertemuan_ke')
            ->get();

        return response()->json($materi);
    }

    /**
     * Detail satu pertemuan.
     */
    public function show($jadwalId, $pertemuanKe)
    {
        $jadwal = Jadwal::findOrFail($jadwalId);
        $this->authorizeDosen($jadwal);

        $materi = MateriPertemuan::where('jadwal_id', $jadwalId)
            ->where('pertemuan_ke', $pertemuanKe)
            ->first();

        if (!$materi) {
            return response()->json([
                'jadwal_id' => (int) $jadwalId,
                'pertemuan_ke' => (int) $pertemuanKe,
                'topik_materi' => null,
                'deskripsi' => null,
                'file_path' => null,
                'file_name' => null,
                'file_type' => null,
            ]);
        }

        return response()->json($materi);
    }

    /**
     * Simpan / update topik & deskripsi materi.
     */
    public function update(MateriRequest $request, $jadwalId, $pertemuanKe)
    {
        $jadwal = Jadwal::findOrFail($jadwalId);
        $this->authorizeDosen($jadwal);

        $materi = MateriPertemuan::updateOrCreate(
            ['jadwal_id' => $jadwalId, 'pertemuan_ke' => $pertemuanKe],
            $request->validated()
        );

        return response()->json([
            'message' => 'Materi updated successfully',
            'data' => $materi,
        ]);
    }

    /**
     * Upload file materi (PDF, DOCX, PPT, dll).
     */
    public function upload(Request $request, $jadwalId, $pertemuanKe)
    {
        $jadwal = Jadwal::findOrFail($jadwalId);
        $this->authorizeDosen($jadwal);

        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx|max:10240',
        ]);

        $materi = MateriPertemuan::firstOrNew(
            ['jadwal_id' => $jadwalId, 'pertemuan_ke' => $pertemuanKe]
        );

        if ($materi->file_path) {
            Storage::disk('public')->delete($materi->file_path);
        }

        $file = $request->file('file');
        $path = $file->store('materi', 'public');

        $materi->file_path = $path;
        $materi->file_name = $file->getClientOriginalName();
        $materi->file_type = $file->getClientOriginalExtension();
        $materi->save();

        return response()->json([
            'message' => 'File uploaded successfully',
            'data' => $materi,
        ]);
    }

    /**
     * Hapus file yang sudah diupload.
     */
    public function deleteFile($jadwalId, $pertemuanKe)
    {
        $jadwal = Jadwal::findOrFail($jadwalId);
        $this->authorizeDosen($jadwal);

        $materi = MateriPertemuan::where('jadwal_id', $jadwalId)
            ->where('pertemuan_ke', $pertemuanKe)
            ->firstOrFail();

        if ($materi->file_path) {
            Storage::disk('public')->delete($materi->file_path);
        }

        $materi->update(['file_path' => null, 'file_name' => null, 'file_type' => null]);

        return response()->json(['message' => 'File deleted successfully']);
    }

    /**
     * Download file materi.
     */
    public function download($id)
    {
        $materi = MateriPertemuan::findOrFail($id);

        if (!$materi->file_path || !Storage::disk('public')->exists($materi->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download(
            $materi->file_path,
            $materi->file_name
        );
    }

    private function authorizeDosen(Jadwal $jadwal): void
    {
        $user = auth()->user();
        $roleIds = $user->roles->pluck('id_role')->toArray();

        if (in_array(1, $roleIds) || in_array(2, $roleIds)) {
            return;
        }

        if ($jadwal->dosen_id !== $user->id) {
            abort(403, 'Forbidden: Anda hanya bisa mengakses jadwal milik Anda sendiri.');
        }
    }
}
