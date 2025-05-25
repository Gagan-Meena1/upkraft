// src/app/Api/userUpdate/route.ts
import { NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';

// Note: bodyParser: false doesn't work the same in App Router
// We'll handle the multipart form data differently

export async function PUT(request: Request) {
  try {
    await connect();
    
    // Get userId from searchParams
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // With App Router, we need to handle form data differently
    const formData = await request.formData();
    
    // Get JSON data
    const userDataString = formData.get('userData');
    if (!userDataString || typeof userDataString !== 'string') {
      return NextResponse.json({ message: 'User data is required' }, { status: 400 });
    }
    
    const userData = JSON.parse(userDataString);
    
    // Prepare update data
    const updateData = {
      username: userData.username,
      email: userData.email,
      contact: userData.contact,
      address: userData.address,
      // Add custom fields that are not in the original schema
      ...(userData.city && { city: userData.city }),
      ...(userData.education && { education: userData.education }),
      ...(userData.skills && { skills: userData.skills }),
      ...(userData.experience && { experience: Number(userData.experience) }),
     ...(userData.studentsCoached && { studentsCoached: Number(userData.studentsCoached) }),
      ...(userData.teachingMode && { teachingMode: userData.teachingMode }),
      ...(userData.instagramLink && { instagramLink: userData.instagramLink }),
      ...(userData.aboutMyself && { aboutMyself: userData.aboutMyself }),
    };

    // Handle profile image if provided
    const profileImage = formData.get('profileImage');
    
    if (profileImage && profileImage instanceof Blob) {
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Directory might already exist, that's fine
      }
      
      // Generate unique filename
      const fileExtension = profileImage.type.split('/')[1] || 'jpg';
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Convert blob to buffer and save file
      const buffer = Buffer.from(await profileImage.arrayBuffer());
      await writeFile(filePath, buffer);
      
      // Set the image URL in update data
      const imageUrl = `/uploads/profiles/${fileName}`;
      updateData.profileImage = imageUrl;
    }

    // Update the user profile in the database
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'Tutor not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      tutor: updatedUser
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({
      message: 'Error updating profile',
      error: error.message
    }, { status: 500 });
  }
}