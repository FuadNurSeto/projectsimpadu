<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SemesterRequest;
use App\Models\Semester;

class SemesterController extends Controller
{
    public function index()
    {
        $semesters = Semester::with('tahunAkademik')->get();

        return response()->json($semesters);
    }

    public function store(SemesterRequest $request)
    {
        $semester = Semester::create($request->validated());

        return response()->json([
            'message' => 'Semester created successfully',
            'data' => $semester->load('tahunAkademik'),
        ], 201);
    }

    public function update(SemesterRequest $request, $id)
    {
        $semester = Semester::findOrFail($id);
        $semester->update($request->validated());

        return response()->json([
            'message' => 'Semester updated successfully',
            'data' => $semester->load('tahunAkademik'),
        ]);
    }

    public function aktif()
    {
        $semesters = Semester::with('tahunAkademik')
            ->where('status', 'aktif')
            ->get();

        return response()->json($semesters);
    }
}
