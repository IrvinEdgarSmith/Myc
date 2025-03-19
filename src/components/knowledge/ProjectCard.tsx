import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Add console log to debug the navigation
    console.log(`Navigating to project with ID: ${project.id}`);
    navigate(`/project/${project.id}`);
  };
  
  return (
    <Card 
      className="bg-mycelial-card/90 border-mycelial-border/30 hover:border-mycelial-secondary/50 transition-all cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardFooter className="text-xs text-muted-foreground">
        Created: {project.createdAt.toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
