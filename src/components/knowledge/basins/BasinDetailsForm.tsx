import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BasinDetailsFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const BasinDetailsForm: React.FC<BasinDetailsFormProps> = ({
  name,
  setName,
  description,
  setDescription,
}) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="basin-name">Name</Label>
        <Input
          id="basin-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter basin name"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="basin-description">Description</Label>
        <Textarea
          id="basin-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter basin description"
          rows={3}
        />
      </div>
    </>
  );
};

export default BasinDetailsForm;
