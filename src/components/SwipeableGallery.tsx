import { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableGalleryProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export default function SwipeableGallery({ projects, onProjectClick }: SwipeableGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 4;
  const maxIndex = Math.max(0, Math.ceil(projects.length / itemsPerPage) - 1);

  useEffect(() => {
    setCurrentIndex(0);
    setTranslateX(0);
  }, [projects.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (Math.abs(translateX) > 100) {
      if (translateX > 0 && currentIndex > 0) {
        goToPrevious();
      } else if (translateX < 0 && currentIndex < maxIndex) {
        goToNext();
      }
    }

    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    if (Math.abs(translateX) > 100) {
      if (translateX > 0 && currentIndex > 0) {
        goToPrevious();
      } else if (translateX < 0 && currentIndex < maxIndex) {
        goToNext();
      }
    }

    setTranslateX(0);
  };

  const goToNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const visibleProjects = projects.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-blue-500 w-8'
                  : 'bg-gray-600 w-1.5 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === maxIndex}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${translateX}px)`,
          }}
        >
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={onProjectClick}
            />
          ))}
        </div>
      </div>

      {projects.length > itemsPerPage && (
        <div className="text-center mt-4 text-sm text-gray-400">
          Showing {currentIndex * itemsPerPage + 1}-{Math.min((currentIndex + 1) * itemsPerPage, projects.length)} of {projects.length}
        </div>
      )}
    </div>
  );
}
