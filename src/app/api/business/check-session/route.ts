import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  sub: string;
  email: string;
  businessId: string;
  role: string;
  iat: number;
  exp: number;
}

interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  category: string;
  status: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  website: string;
  socialMedia: string;
  businessHours: string;
  description: string;
  photos: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('qrewards_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ 
        hasSession: false, 
        message: "No session cookie found" 
      });
    }

    // Verify the JWT
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as JWTPayload;
      
      // Fetch business data
      const client = generateClient();
      const businessResult = await client.graphql({
        query: `
          query GetBusiness($id: String!) {
            getBusiness(id: $id) {
              id
              name
              phone
              email
              zipCode
              category
              status
              logo
              address
              city
              state
              website
              socialMedia
              businessHours
              description
              photos
              primaryContactEmail
              primaryContactPhone
              createdAt
              updatedAt
              approvedAt
            }
          }
        `,
        variables: {
          id: decoded.businessId,
        },
      });

      const business = (businessResult as { data: { getBusiness: Business | null } }).data.getBusiness;

      return NextResponse.json({ 
        hasSession: true, 
        user: {
          id: decoded.sub,
          email: decoded.email,
          businessId: decoded.businessId,
          role: decoded.role
        },
        business: business,
        message: "Valid session found" 
      });
    } catch {
      return NextResponse.json({ 
        hasSession: false, 
        message: "Invalid session token" 
      });
    }
  } catch (error) {
    console.error("Check session error:", error);
    return NextResponse.json({ 
      hasSession: false, 
      message: "Error checking session" 
    }, { status: 500 });
  }
} 