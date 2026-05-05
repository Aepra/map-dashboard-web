"use client";

import React, { useMemo, useRef, useState } from 'react';

/**
 * SchoolSearchPanel - top-right quick search for schools
 */
export const SchoolSearchPanel = ({
  schools,
  selectedSchool,
  setSelectedSchool,
  variant = 'panel',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const blurTimer = useRef(null);

  const filteredSchools = useMemo(() => {
    if (!searchTerm.trim()) return schools;
    const term = searchTerm.toLowerCase();
    return schools.filter((school) => school.nama.toLowerCase().includes(term));
  }, [schools, searchTerm]);

  const handleSelect = (schoolName) => {
    setSelectedSchool(schoolName);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setIsOpen(true);
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setIsOpen(false), 150);
  };

  if (variant === 'navbar') {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
          <span className="text-xs text-gray-500">Cari sekolah</span>
          <input
            type="text"
            placeholder="Ketik nama sekolah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {selectedSchool && (
            <button
              onClick={() => setSelectedSchool(selectedSchool)}
              className="text-[11px] text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          )}
        </div>
        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            <div className="px-3 py-2 text-[11px] text-gray-500 bg-gray-50 border-b border-gray-100">
              Hasil: {Math.min(filteredSchools.length, 8)} / {schools.length}
            </div>
            <div className="max-h-44 overflow-y-auto">
              {filteredSchools.length === 0 ? (
                <div className="px-3 py-3 text-xs text-gray-500">Sekolah tidak ditemukan</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredSchools.slice(0, 8).map((school) => (
                    <button
                      key={school.nama}
                      onClick={() => handleSelect(school.nama)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        selectedSchool === school.nama ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900 truncate">{school.nama}</div>
                      <div className="text-xs text-gray-600">
                        {school.totalSiswa.toLocaleString('id-ID')} siswa
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/95 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm w-72 pointer-events-auto overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-gray-700">Cari Sekolah</div>
          <div className="text-[11px] text-gray-500">Klik untuk filter siswa</div>
        </div>
        {selectedSchool && (
          <button
            onClick={() => setSelectedSchool(selectedSchool)}
            className="text-[11px] text-blue-600 hover:text-blue-700"
          >
            Reset
          </button>
        )}
      </div>
      <div className="px-4 py-3">
        <input
          type="text"
          placeholder="Ketik nama sekolah..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="px-4 py-2 text-[11px] text-gray-500">
          Hasil: {Math.min(filteredSchools.length, 10)} / {schools.length}
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filteredSchools.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500">Sekolah tidak ditemukan</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSchools.slice(0, 10).map((school) => (
                <button
                  key={school.nama}
                  onClick={() => handleSelect(school.nama)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white ${
                    selectedSchool === school.nama ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900 truncate">{school.nama}</div>
                  <div className="text-xs text-gray-600">
                    {school.totalSiswa.toLocaleString('id-ID')} siswa
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
