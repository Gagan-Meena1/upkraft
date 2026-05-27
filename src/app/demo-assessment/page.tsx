import React from 'react';
import { AssessmentForm } from '@/components/AssessmentReport/AssessmentForm';

export const metadata = {
  title: 'Demo Assessment Form | UpKraft',
  description: 'Generate Student Demo Assessment Reports dynamically.',
};

export default function DemoAssessmentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto">
        <AssessmentForm />
      </div>
    </div>
  );
}
