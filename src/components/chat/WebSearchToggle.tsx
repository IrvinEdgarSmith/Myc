import React from 'react';
import { Button } from '../ui/button';

interface WebSearchToggleProps {
  workspaceId: string;
}

// This component is now empty as we're removing web search entirely
const WebSearchToggle: React.FC<WebSearchToggleProps> = ({ workspaceId }) => {
  return null;
};

export default WebSearchToggle;
