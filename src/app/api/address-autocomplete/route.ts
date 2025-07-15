import { NextRequest, NextResponse } from "next/server";
import { LocationClient, SearchPlaceIndexForSuggestionsCommand } from "@aws-sdk/client-location";

const client = new LocationClient({ region: "us-west-1" });
const PLACE_INDEX_NAME = "QRewardsPlaceIndex";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const command = new SearchPlaceIndexForSuggestionsCommand({
    IndexName: PLACE_INDEX_NAME,
    Text: query,
    MaxResults: 5,
  });

  try {
    const result = await client.send(command);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suggestions = (result as { suggestions?: Array<{ text: string; placeId?: string; categories?: string[] }> }).suggestions || [];
    
    // Transform suggestions to match expected format
    const formattedSuggestions = suggestions.map((suggestion) => ({
      text: suggestion.text,
      placeId: suggestion.placeId,
      categories: suggestion.categories || []
    }));
    
    return NextResponse.json(formattedSuggestions);
  } catch (error: unknown) {
    console.error("AWS Place Index error:", error);
    
    // Type guard for AWS errors
    const awsError = error as { name?: string; message?: string };
    
    // Check if it's a resource not found error (Place Index doesn't exist)
    if (awsError.name === 'ResourceNotFoundException') {
      console.warn(`Place Index "${PLACE_INDEX_NAME}" not found. Please create it in AWS Location Service.`);
      return NextResponse.json({ 
        error: "Address autocomplete not configured. Please contact support.",
        details: "AWS Place Index not found"
      }, { status: 503 });
    }
    
    // Check if it's an access denied error
    if (awsError.name === 'AccessDeniedException') {
      console.warn("Access denied to AWS Location Service. Check IAM permissions.");
      return NextResponse.json({ 
        error: "Address autocomplete not available. Please contact support.",
        details: "Access denied to location service"
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: "Failed to fetch suggestions",
      details: awsError.message || "Unknown error"
    }, { status: 500 });
  }
} 