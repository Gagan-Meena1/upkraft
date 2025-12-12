// src/app/Api/tutors/names/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';

export async function POST(request: NextRequest) {
  try {
    await connect();

    const { classIds } = await request.json();
    // console.log("Received classIds:", classIds);

    // Validate input
    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
      return NextResponse.json(
        { error: 'classIds array is required' },
        { status: 400 }
      );
    }

    // Limit to 10 classes as requested
    const limitedClassIds = classIds.slice(0, 10);

    // Single database query to find all tutors who have any of these classes
    // This searches in the classes array of users with category 'Tutor'
    const tutors = await User.find({
      category: 'Tutor',
      classes: { $in: limitedClassIds }
    })
      .select('_id username classes')
      .lean(); // lean() returns plain JS objects, faster than Mongoose documents

    // Build the response mapping classId -> tutorName
    // Each class can have one tutor
    const result: Record<string, string | null> = {};
    
    // Initialize all classIds with null
    limitedClassIds.forEach(classId => {
      result[classId] = null;
    });

    // Map each class to its tutor
    tutors.forEach(tutor => {
      tutor.classes.forEach((classId: any) => {
        const classIdStr = classId.toString();
        if (limitedClassIds.includes(classIdStr)) {
          result[classIdStr] = tutor.username;
        }
      });
    });

    return NextResponse.json({
      success: true,
      tutorNames: result
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching tutor names:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tutor names',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}