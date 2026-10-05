import os
import glob
import re

base_dir = "apps/web/src/app/(dashboard)/teacher"
files = glob.glob(f"{base_dir}/**/*.tsx", recursive=True)

search_pattern = r"""\s*const activeYear = await prisma\.academicYear\.findFirst\(\{\s*orderBy:\s*\{\s*startDate:\s*'desc'\s*\}\s*\}\);\s*if\s*\(!activeYear\)\s*\{\s*return\s*\(\s*<div[^>]*>\s*<div[^>]*>[\s\n]*Tidak ada Tahun Ajaran aktif\.[\s\n]*<\/div>\s*<\/div>\s*\);\s*\}"""

replacement = """
  const { getActiveAcademicYears } = await import("@/lib/academic-year");
  const activeYears = await getActiveAcademicYears();

  if (activeYears.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg">
          Tidak ada Tahun Ajaran aktif.
        </div>
      </div>
    );
  }
  const activeYearIds = activeYears.map(y => y.id);
  const activeYearNames = Array.from(new Set(activeYears.map(y => y.name))).join(', ');
"""

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    if "prisma.academicYear.findFirst" in content:
        # Replace the fetch logic
        content = re.sub(search_pattern, replacement, content, flags=re.MULTILINE)
        
        # Replace usages of activeYear.id
        content = content.replace("academicYearId: activeYear.id", "academicYearId: { in: activeYearIds }")
        
        # Replace activeYearId assignment for props if any, we'll just check if it's there
        # For GradeClient, it passes academicYearId={activeYear.id}. We should probably pass academicYearIds
        # Wait, if components expect academicYearId: string, this will break. Let's look at that.
        
        # Just write for now to see
        with open(f, 'w') as file:
            file.write(content)
        print(f"Patched {f}")
