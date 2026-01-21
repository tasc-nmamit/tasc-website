import { Faculty } from "@prisma/client";
import FacultyCard from "./FacultyCard";

interface FacultyViewProps {
  faculties: Faculty[];
}

export default function FacultyView({ faculties }: FacultyViewProps) {
  return (
    <div className="grid gap-y-12 px-6 py-10 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] justify-items-center justify-center md:px-12 lg:px-16">
      {faculties.map((faculty) => (
        <FacultyCard key={faculty.id} faculty={faculty} />
      ))}
    </div>
  );
}
