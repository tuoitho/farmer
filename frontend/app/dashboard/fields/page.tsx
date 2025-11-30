import Sidebar from "../Sidebar";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TFarm } from "@/models/farm";
import farmApi from "@/services/farm";
import FieldsClient from "./FieldsClient";

const img1 = "https://www.figma.com/api/mcp/asset/0f961402-38df-4a20-a6fe-dc4ea536b4a6";
const img2 = "https://www.figma.com/api/mcp/asset/45a84cac-4791-4ebf-9f34-1f34823bfc73";

async function getFieldsData(): Promise<TFarm[]> {
  try {
    const productRes = await farmApi.getFarms();
    // Extract farm data from response structure
    const response = productRes as any;
    const farms = response?.data?.data || 
                  response?.data?.farms || 
                  response?.data || 
                  [];
    
    return Array.isArray(farms) ? farms : [];
  } catch (error) {
    console.error('Failed to fetch farm data:', error);
    return [];
  }
}

export default async function FieldsPage() {
  const fields = await getFieldsData();
  
  return <FieldsClient fields={fields} />;
}
