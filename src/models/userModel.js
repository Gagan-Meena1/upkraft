import mongoose from "mongoose";
import { type } from "os";
import { start } from "repl";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
    },
    age: {
        type: Number,
        default: 1  
    },
    address: {
        type: String,
        default: ""
    },
    attendance: {
        type:[{
            classId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Class"
            },
            status:{
                type:String,
                enum:["present","absent","canceled","not_marked"],
                default:"not_marked"

        }}]
    },
    contact: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: [true, "email is not unique"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    instructorId: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users"
            }
        ]
    },
    category: {
        type: String,
        required: [true, "please state your role"]
    },
    courses: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "courseName",
            }
        ]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    }],
    // Additional Tutor Profile Fields
    profileImage: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    timezone: {
        type: String,
        default: "Asia/Calcutta"
    },
   
    skills: {
        type: String,
        default: ""
    },
    experience: {
        type: Number,
        default: 0
    },
    education: {
        type: String,
        default: ""
    },
    studentsCoached: {
        type: Number,
        default: 0
    },
    teachingMode: {
        type: String,
        enum: ["Online", "In-person", "Both", "","Hybrid"],
        default: ""
    },
    instagramLink:{
        type:String,
        default:""
    },
    assignment:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment"
    }],

    pendingAssignments: [{
       studentId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "users"
       },
       assignmentIds: [{
           type: mongoose.Schema.Types.ObjectId,
           ref: "Assignment"
       }]
   }],

    aboutMyself: {
        type: String,
        default: ""
    },
    state:{
        type:String,
        enum:["active","inactive","vacation","dormant","blocked"],
        default:"active"
    },
    slotsAvailable:{
        type:[{
            startTime: Date,
            endTime: Date
        }]
    },
    academyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    tutors:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }],

    },
    students:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }],

    },
    // ✅ User → Songs relation (many likes)
    likedSongs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
    }],
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    paymentMethodsSettings: {
        selectedMethods: {
            type: [String],
            default: ['UPI', 'Net Banking', 'Card', 'Cash']
        },
        preferredMethod: {
            type: String,
            default: 'UPI'
        },
        paymentGateway: {
            type: String,
            default: 'Razorpay'
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    policiesSettings: {
        lateFeePolicy: {
            type: String,
            default: '₹200 per day (Max ₹1,500)'
        },
        daysUntilOverdue: {
            type: Number,
            default: 3
        },
        earlyPaymentDiscount: {
            type: Number,
            default: 0
        },
        autoSuspendAfter: {
            type: Number,
            default: 7
        }
    },
    taxSettings: {
        defaultGSTRate: {
            type: String,
            default: '18%'
        },
        academyGSTIN: {
            type: String,
            default: ''
        },
        invoicePrefix: {
            type: String,
            default: 'INV'
        },
        nextInvoiceNumber: {
            type: Number,
            default: 125
        }
    },
    tutorPayoutSettings: {
        commissionModel: {
            type: String,
            enum: ['Percentage of Course Fee', 'Fixed Amount per Session'],
            default: 'Percentage of Course Fee'
        },
        commissionPercentage: {
            type: Number,
            default: 70,
            min: 0,
            max: 100
        },
        payoutFrequency: {
            type: String,
            enum: ['Weekly', 'Monthly'],
            default: 'Monthly'
        },
        minimumPayoutAmount: {
            type: String,
            default: '₹1,000'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    packagePricingSettings: {
        pricingModel: {
            type: String,
            enum: ['Monthly Subscription', 'Package'],
            default: 'Monthly Subscription'
        },
        packagePricing: [{
            name: {
                type: String,
                required: true
            },
            sessions: {
                type: Number,
                required: true,
                min: 1
            },
            perSessionRate: {
                type: Number,
                required: true,
                min: 0
            },
            discount: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            totalPrice: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        monthlySubscriptionPricing: [{
            months: {
                type: Number,
                required: true,
                enum: [1, 3, 6, 9, 12]
            },
            discount: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        }]
    },
},
{timestamps: true}
);

userSchema.index({ _id: 1, category: 1 });
userSchema.index({ likedSongs: 1 });

const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;
