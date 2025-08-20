import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🧪 Simple Test: Starting...');
    
    // Test 1: Check if we can import Amplify
    console.log('🧪 Simple Test: Testing Amplify import...');
    let Amplify;
    try {
      const amplifyModule = require("aws-amplify");
      console.log('🧪 Simple Test: Amplify module keys:', Object.keys(amplifyModule));
      Amplify = amplifyModule.default || amplifyModule;
      console.log('🧪 Simple Test: Amplify object keys:', Object.keys(Amplify));
      console.log('🧪 Simple Test: Amplify imported successfully');
    } catch (importError) {
      console.error('🧪 Simple Test: Failed to import Amplify:', importError);
      return NextResponse.json({
        success: false,
        error: "Failed to import Amplify",
        details: importError instanceof Error ? importError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Test 2: Check if we can import generateClient
    console.log('🧪 Simple Test: Testing generateClient import...');
    let generateClient;
    try {
      const apiModule = require("aws-amplify/api");
      generateClient = apiModule.generateClient;
      console.log('🧪 Simple Test: generateClient imported successfully');
    } catch (importError) {
      console.error('🧪 Simple Test: Failed to import generateClient:', importError);
      return NextResponse.json({
        success: false,
        error: "Failed to import generateClient",
        details: importError instanceof Error ? importError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Test 3: Check if we can read the outputs file
    console.log('🧪 Simple Test: Testing outputs file...');
    let outputs;
    try {
      outputs = require("../../../../amplify_outputs.json");
      console.log('🧪 Simple Test: Outputs file read successfully');
      console.log('🧪 Simple Test: API Key exists:', !!outputs.data.api_key);
      console.log('🧪 Simple Test: API URL:', outputs.data.url);
    } catch (importError) {
      console.error('🧪 Simple Test: Failed to read outputs file:', importError);
      return NextResponse.json({
        success: false,
        error: "Failed to read outputs file",
        details: importError instanceof Error ? importError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Test 4: Try to configure Amplify
    console.log('🧪 Simple Test: Testing Amplify configuration...');
    try {
      Amplify.configure(outputs);
      console.log('🧪 Simple Test: Amplify configured successfully');
    } catch (configError) {
      console.error('🧪 Simple Test: Failed to configure Amplify:', configError);
      return NextResponse.json({
        success: false,
        error: "Failed to configure Amplify",
        details: configError instanceof Error ? configError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Test 5: Try to generate a client
    console.log('🧪 Simple Test: Testing client generation...');
    try {
      const client = generateClient({ authMode: 'apiKey' });
      console.log('🧪 Simple Test: Client generated successfully');
      
      return NextResponse.json({
        success: true,
        message: "All basic tests passed",
        testResults: {
          amplifyImported: true,
          generateClientImported: true,
          outputsRead: true,
          amplifyConfigured: true,
          clientGenerated: true
        }
      });
      
    } catch (clientError) {
      console.error('🧪 Simple Test: Failed to generate client:', clientError);
      return NextResponse.json({
        success: false,
        error: "Failed to generate client",
        details: clientError instanceof Error ? clientError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('🧪 Simple Test: Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: "Unexpected error during test",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
