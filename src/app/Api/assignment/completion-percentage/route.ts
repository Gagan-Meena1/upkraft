// Need to create new api

// Src>app>api>assignment>completation-percentage>route.ts



// /app/api/assignments/completion-percentage/route.ts
import { NextResponse } from "next/server";
import Assignment from '@/models/assignment';
import { connect } from '@/dbConnection/dbConfic';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function GET(request: NextResponse) {
  try {
    await connect();

    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('userId');

    let userId;
    if (userIdParam) {
      userId = userIdParam;
    } else {
      const token = request.cookies.get("token")?.value;
      const decodedToken = token ? jwt.decode(token) : null;
      userId = decodedToken && typeof decodedToken === "object" ? decodedToken.id : null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID missing" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const result = await Assignment.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$status", 1, 0] } }
        }
      }
    ]);

    if (!result.length) {
      return NextResponse.json({ percentage: 0, total: 0, completed: 0 });
    }

    const { total, completed } = result[0];
    const percentage = Math.round((completed / total) * 100);

    return NextResponse.json({ total, completed, percentage });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}