import { NextResponse, NextRequest } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';
import feedback from '@/models/feedback';
import FeedbackDance from '@/models/feedbackDance';
import FeedbackDrawing from '@/models/feedbackDrawing';
import FeedbackDrums from '@/models/feedbackDrums';
import FeedbackViolin from '@/models/feedbackViolin';
import FeedbackVocal from '@/models/feedbackVocal';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

await connect();

// Define which fields are numeric scores for each feedback model
const SCORE_FIELDS: Record<string, string[]> = {
    music: ['rhythm', 'theoreticalUnderstanding', 'performance', 'earTraining', 'assignment', 'technique'],
    dance: ['technique', 'musicality', 'retention', 'performance', 'effort'],
    drawing: ['observationalSkills', 'lineQuality', 'proportionPerspective', 'valueShading', 'compositionCreativity'],
    drums: ['techniqueAndFundamentals', 'timingAndTempo', 'coordinationAndIndependence', 'dynamicsAndMusicality', 'patternKnowledgeAndReading', 'progressAndPracticeHabits'],
    violin: ['postureAndInstrumentHold', 'bowingTechnique', 'intonationAndPitchAccuracy', 'toneQualityAndSoundProduction', 'rhythmMusicalityAndExpression', 'progressAndPracticeHabits'],
    vocal: ['vocalTechniqueAndControl', 'toneQualityAndRange', 'rhythmTimingAndMusicality', 'dictionAndArticulation', 'expressionAndPerformance', 'progressAndPracticeHabits'],
};

// Calculate average score for a single feedback entry given its score fields
function getEntryAverage(entry: any, fields: string[]): number | null {
    let total = 0;
    let count = 0;
    for (const field of fields) {
        const val = Number(entry[field]);
        if (!isNaN(val) && val > 0) {
            total += val;
            count++;
        }
    }
    return count > 0 ? total / count : null;
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get("userId");
        
        // Priority 1: impersonation token (RSM acting as tutor — web only)
        // Priority 2: session cookie (web browser)
        // Priority 3: Bearer token in Authorization header (React Native mobile app)
        const referer = request.headers.get("referer") || "";
        let refererPath = "";
        try { if (referer) refererPath = new URL(referer).pathname; } catch (e) {}
        const isTutorContext = refererPath.startsWith("/tutor") || (request.nextUrl && request.nextUrl.pathname && request.nextUrl.pathname.startsWith("/Api/tutor"));
        const impersonateToken = request.cookies.get("impersonate_token")?.value;
        const authHeader = request.headers.get("Authorization") || "";
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        const token = (isTutorContext && impersonateToken)
            ? impersonateToken
            : (request.cookies.get("token")?.value || bearerToken || "");

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }
        
        // Decode token to verify user
        const decodedToken = jwt.decode(token);
        const authenticatedUserId = decodedToken && typeof decodedToken === 'object' && 'id' in decodedToken ? decodedToken.id : null;
        
        if (!authenticatedUserId) {
            return NextResponse.json({
                success: false,
                error: 'Invalid authentication token'
            }, { status: 401 });
        }
        
        // Determine which user to fetch feedback for
        const targetUserId = userId || authenticatedUserId;
        
        // Fetch user to get their classes
        const user = await User.findById(targetUserId).select('classes username email');
        
        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }
        
        // Check if user has any classes
        if (!user.classes || user.classes.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'User has no classes enrolled',
                averageScore: null
            }, { status: 200 });
        }
        
        // Build query to fetch feedback for user's classes
        const query: any = {
            userId: targetUserId,
            classId: { $in: user.classes }
        };
        
        // Fetch feedback from ALL models in parallel
        const [musicFeedback, danceFeedback, drawingFeedback, drumsFeedback, violinFeedback, vocalFeedback] = await Promise.all([
            feedback.find(query).lean(),
            (FeedbackDance as any).find(query).lean(),
            (FeedbackDrawing as any).find(query).lean(),
            (FeedbackDrums as any).find(query).lean(),
            (FeedbackViolin as any).find(query).lean(),
            (FeedbackVocal as any).find(query).lean(),
        ]);
        
        // Collect all per-entry averages
        const allAverages: number[] = [];
        
        const addAverages = (entries: any[], fields: string[]) => {
            for (const entry of entries) {
                const avg = getEntryAverage(entry, fields);
                if (avg !== null) allAverages.push(avg);
            }
        };
        
        addAverages(musicFeedback, SCORE_FIELDS.music);
        addAverages(danceFeedback, SCORE_FIELDS.dance);
        addAverages(drawingFeedback, SCORE_FIELDS.drawing);
        addAverages(drumsFeedback, SCORE_FIELDS.drums);
        addAverages(violinFeedback, SCORE_FIELDS.violin);
        addAverages(vocalFeedback, SCORE_FIELDS.vocal);
        
        if (allAverages.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No feedback found',
                averageScore: null
            }, { status: 200 });
        }
        
        // Overall average: average of all individual feedback entry averages
        const overallAverage = allAverages.reduce((sum, v) => sum + v, 0) / allAverages.length;
        
        return NextResponse.json({
            success: true,
            averageScore: parseFloat(overallAverage.toFixed(1)),
        }, { status: 200 });
        
    } catch (error: any) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch feedback',
            error: error.stack
        }, { status: 500 });
    }
}