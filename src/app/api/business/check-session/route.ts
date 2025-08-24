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
    const lastBusinessId = request.headers.get('x-last-business-id');
    
    console.log('🔍 Check-Session - Session token:', sessionToken ? 'present' : 'missing');
    console.log('🔍 Check-Session - Last business ID from header:', lastBusinessId || 'not provided');
    
    if (!sessionToken) {
      return NextResponse.json({ 
        hasSession: false, 
        message: "No session cookie found" 
      });
    }

    // Verify the JWT
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as JWTPayload;
      
      const client = generateClient({ authMode: "apiKey" });
      
      // Fetch user data to get firstName and lastName
      const userResult = await client.graphql({
        query: `
          query GetBusinessUser($id: ID!) {
            getBusinessUser(id: $id) {
              id
              email
              firstName
              lastName
              role
              status
              businessId
            }
          }
        `,
        variables: {
          id: decoded.sub,
        },
      });

      const user = (userResult as { data: { getBusinessUser: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        businessId: string;
      } | null } }).data.getBusinessUser;

      if (!user) {
        return NextResponse.json({ 
          hasSession: false, 
          message: "User not found" 
        });
      }
      
      // Determine which business ID to use
      let targetBusinessId = decoded.businessId; // Default to session cookie business ID
      
      // If lastBusinessId is provided, check if user has access to it
      if (lastBusinessId && lastBusinessId !== decoded.businessId) {
        console.log('🔍 Check-Session - Last business ID provided, checking access...');
        
        // Check if user has access to the last business ID
        const userAccessResult = await client.graphql({
          query: `
            query GetBusinessUser($email: String!, $businessId: String!) {
              listBusinessUsers(filter: {
                email: { eq: $email },
                businessId: { eq: $businessId }
              }) {
                items {
                  id
                  businessId
                  status
                }
              }
            }
          `,
          variables: {
            email: user.email,
            businessId: lastBusinessId,
          },
        });
        
        const userAccess = (userAccessResult as { data: { listBusinessUsers: { items: Array<{ id: string; businessId: string; status: string }> } } }).data.listBusinessUsers.items;
        
        if (userAccess.length > 0 && userAccess[0].status === 'active') {
          targetBusinessId = lastBusinessId;
          console.log('🔍 Check-Session - ✅ User has access to last business, using it:', lastBusinessId);
        } else {
          console.log('🔍 Check-Session - ❌ User does not have access to last business, using session business:', decoded.businessId);
        }
      } else {
        console.log('🔍 Check-Session - Using session business ID:', decoded.businessId);
      }
      
      // Fetch business data using the determined business ID
      const businessResult = await client.graphql({
        query: `
          query GetBusiness($id: ID!) {
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
              neighborhood
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
          id: targetBusinessId,
        },
      });

      const business = (businessResult as { data: { getBusiness: Business | null } }).data.getBusiness;

      return NextResponse.json({ 
        hasSession: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessId: user.businessId,
          role: user.role,
          status: user.status
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