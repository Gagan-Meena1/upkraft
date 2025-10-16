import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConnection/dbConfic';


// Metrics we track for class quality
const QUALITY_METRICS = [
  'session_focus_clarity_score',
  'content_delivery_score',
  'student_engagement_score',
  'student_progress_score',
  'key_performance_score',
  'communication_score',
  'overall_quality_score'
] as const;

type QualityMetric = typeof QUALITY_METRICS[number];

interface AggregationResult {
  total: number;
  count: number;
}

interface ClassEvaluation {
  _id: string;
  evaluation?: {
    [key in QualityMetric]?: number;
  } & {
    [key: string]: any; // For justification fields
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get and validate courseId
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter is required' },
        { status: 400 }
      );
    }

    // Connect to database and get Class model
    await connect();
    const { default: Class } = await import('@/models/Class');
    const { default: courseName } = await import('@/models/courseName'); // Import courseName model


    // Find all classes for this course with explicit field selection
    const classes = await Class.find(
      { course: courseId },
      {
        _id: 1,
        evaluation: 1
      }
    ).lean() as ClassEvaluation[];

    // Filter classes that have evaluation data
    const classesWithEvaluation = classes.filter(c => c.evaluation);
    const totalClassCount = classes.length;

    if (classesWithEvaluation.length === 0) {
      return NextResponse.json({
        error: 'No evaluated classes found for this course yet. Class quality scores will be aggregated here once classes are evaluated.',
        hasEvaluation: false,
        total_classes: totalClassCount,
        evaluated_classes: 0
      });
    }

    // Initialize aggregation object
    const aggregation = QUALITY_METRICS.reduce<Record<QualityMetric, AggregationResult>>((acc, metric) => {
      acc[metric] = { total: 0, count: 0 };
      return acc;
    }, {} as Record<QualityMetric, AggregationResult>);

    // Calculate totals for each metric
    classesWithEvaluation.forEach(({ evaluation }) => {
      if (!evaluation) return;

      QUALITY_METRICS.forEach(metric => {
        const score = evaluation[metric];
        if (typeof score === 'number') {
          aggregation[metric].total += score;
          aggregation[metric].count++;
        }
      });
    });

    // Calculate averages for each metric
    const averageScores = Object.entries(aggregation).reduce<Record<string, number>>((acc, [metric, { total, count }]) => {
      if (count > 0) {
        acc[metric] = total / count;
      }
      return acc;
    }, {});

    // Generate response
      // UPDATE: Save the overall_quality_score to the courseName schema
    if (averageScores.overall_quality_score !== undefined) {
      await courseName.findByIdAndUpdate(
        courseId,
        { 
          courseQuality: parseFloat(averageScores.overall_quality_score.toFixed(2))
        },
        { new: true }
      );
    }
    const justification = `This course quality score is based on ${classesWithEvaluation.length} evaluated ${
      classesWithEvaluation.length === 1 ? 'class' : 'classes'
    } out of ${totalClassCount} total ${
      totalClassCount === 1 ? 'class' : 'classes'
    }. ${
      classesWithEvaluation.length === totalClassCount 
        ? 'All classes have been evaluated.' 
        : 'Some classes are pending evaluation.'
    }`;

    return NextResponse.json({
      ...averageScores,
      total_classes: totalClassCount,
      evaluated_classes: classesWithEvaluation.length,
      justification,
      hasEvaluation: true
    });

  } catch (error: any) {
    console.error('Error calculating course quality:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while calculating course quality.',
        hasEvaluation: false
      },
      { status: 500 }
    );
  }
} 