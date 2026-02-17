// src/app/Api/userUpdate/route.ts
import { NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import User from '@/models/userModel';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary (you can also do this in a separate config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(request: Request) {
  try {
    await connect();

    // Get userId from searchParams
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Handle form data
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
      timezone: userData.timezone,
      profileImage: undefined, // Initialize to avoid TS error
      // Add custom fields that are not in the original schema
      ...(userData.city && { city: userData.city }),
      ...(userData.education && { education: userData.education }),
      ...(userData.skills && { skills: userData.skills }),
      ...(userData.experience && { experience: Number(userData.experience) }),
      ...(userData.studentsCoached && { studentsCoached: Number(userData.studentsCoached) }),
      ...(userData.teachingMode && { teachingMode: userData.teachingMode }),
      ...(userData.instagramLink && { instagramLink: userData.instagramLink }),
      ...(userData.aboutMyself && { aboutMyself: userData.aboutMyself }),
      ...(userData.tutorPayoutSettings && { tutorPayoutSettings: userData.tutorPayoutSettings }),
    };

    // Handle profile image if provided
    const profileImage = formData.get('profileImage');

    if (profileImage && profileImage instanceof Blob) {
      try {
        // Convert blob to buffer
        const buffer = Buffer.from(await profileImage.arrayBuffer());

        // Generate unique public_id for Cloudinary
        const publicId = `profiles/${userId}_${uuidv4()}`;

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              public_id: publicId,
              folder: "profiles", // Optional: organize uploads in folders
              transformation: [
                { width: 500, height: 500, crop: "fill" }, // Optional: resize/crop image
                { quality: "auto", fetch_format: "auto" } // Optional: optimize quality and format
              ]
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(buffer);
        });

        // Set the Cloudinary URL in update data
        updateData.profileImage = (uploadResult as any).secure_url;

      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return NextResponse.json({
          message: 'Error uploading profile image',
          error: uploadError
        }, { status: 500 });
      }
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