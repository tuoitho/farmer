import { TFarm } from "@/models/farm";
import farmApi from "@/services/farm";
import FieldDetailClient from "./FieldDetailClient";

async function getData(id: string): Promise<TFarm | null> {
  try {
    const response = await farmApi.getFarmById(id);
    
    // Extract farm data from response structure
    const apiResponse = response as any;
    let farm = null;
    
    if (apiResponse?.success && apiResponse?.data) {
      farm = apiResponse.data;
    } else {
      farm = apiResponse?.data?.data || 
             apiResponse?.data?.farm || 
             apiResponse?.data || 
             apiResponse || 
             null;
    }
    
    return farm;
  } catch (error) {
    return null;
  }
}

export default async function FieldDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: farmId } = await params;
  
  if (!farmId) {
    return <FieldDetailClient farm={null} />;
  }
  
  const farm = await getData(farmId);
  
  return <FieldDetailClient farm={farm} />;
}
