import React, { useMemo, useState } from 'react';
import { getSchoolColorRGB } from './schoolColors';

/**
 * Sidebar - School list with search
 */
export const Sidebar = ({
	schools,
	selectedSchool,
	setSelectedSchool,
	filteredCount,
	totalCount,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [isExpanded, setIsExpanded] = useState(true);

	const filteredSchools = useMemo(() => {
		if (!searchTerm.trim()) return schools;
		const term = searchTerm.toLowerCase();
		return schools.filter((school) => school.nama.toLowerCase().includes(term));
	}, [schools, searchTerm]);

	const handleSelectSchool = (schoolName) => {
		setSelectedSchool(schoolName);
	};

	return (
		<div
			className={`absolute right-4 top-4 h-[calc(100%-2rem)] bg-white/95 rounded-lg shadow-lg border border-gray-200 backdrop-blur-sm z-40 flex flex-col transition-all ${
				isExpanded ? 'w-80' : 'w-12'
			}`}
		>
			<div className="flex items-center justify-between p-3 border-b border-gray-200">
				{isExpanded && <div className="text-sm font-semibold text-gray-900">Sekolah</div>}
				<button
					onClick={() => setIsExpanded((prev) => !prev)}
					className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-700"
					title={isExpanded ? 'Collapse' : 'Expand'}
				>
					{isExpanded ? '→' : '←'}
				</button>
			</div>

			{isExpanded && (
				<>
					<div className="p-3 border-b border-gray-200">
						<input
							type="text"
							placeholder="Cari sekolah..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="px-3 py-2 border-b border-gray-200 bg-blue-50">
						<div className="text-xs text-gray-600 flex justify-between">
							<span>Total Siswa</span>
							<span className="font-semibold text-blue-600">
								{filteredCount.toLocaleString('id-ID')}
							</span>
						</div>
						<div className="text-xs text-gray-600 flex justify-between mt-1">
							<span>Dari</span>
							<span className="font-semibold text-blue-600">
								{totalCount.toLocaleString('id-ID')}
							</span>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto">
						{filteredSchools.length === 0 ? (
							<div className="p-4 text-sm text-gray-500 text-center">Sekolah tidak ditemukan</div>
						) : (
							<div className="divide-y divide-gray-100">
								{filteredSchools.map((school) => {
									const isSelected = selectedSchool === school.nama;
									const schoolColor = getSchoolColorRGB(school.nama);

									return (
										<button
											key={school.nama}
											onClick={() => handleSelectSchool(school.nama)}
											className={`w-full text-left p-3 hover:bg-gray-50 ${
												isSelected ? 'bg-blue-50 border-l-4' : ''
											}`}
											style={isSelected ? { borderLeftColor: schoolColor } : {}}
										>
											<div className="flex items-start gap-3">
												<div
													className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
													style={{ backgroundColor: schoolColor }}
												/>
												<div className="flex-1 min-w-0">
													<div className="text-sm font-medium text-gray-900 truncate">
														{school.nama}
													</div>
													<div className="text-xs text-gray-600 mt-1">
														Total: {school.totalSiswa.toLocaleString('id-ID')}
													</div>
												</div>
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};
