import { Wheat } from "lucide-react";

interface FeatureCardProps {
  icon?: React.ReactNode | null;
  title: string;
  description: string;
  variant?: "default" | "primary";
}

export default function FeatureCard({ 
  icon = null, 
  title, 
  description,
  variant = "default" 
}: FeatureCardProps) {
  const bgColor = variant === "primary" ? "bg-[#2e8623]" : "bg-[#ebf5ed]";
  const textColor = variant === "primary" ? "text-[#fffcf6]" : "text-black";
  const iconBgColor = variant === "primary" ? "bg-[#ebf5ed]" : "bg-[#2e8623]";
  const iconColor = variant === "primary" ? "text-[#191f19]" : "text-[#fffcf6]";

  return (
    <div className={`${bgColor} box-border flex flex-col gap-[10px] h-[271px] items-start overflow-clip p-[30px] rounded-[18px] w-[270px]`}>
      {icon || (
        <div className={`${iconBgColor} box-border flex items-center justify-center p-[15px] relative rounded-[50px] shrink-0`}>
          <Wheat className={`size-[20px] ${iconColor}`} />
        </div>
      )}
      <div className={`capitalize font-['Be_Vietnam_Pro'] font-semibold leading-[normal] min-w-full relative shrink-0 text-[24px] ${textColor} w-[min-content] whitespace-pre-wrap`}>
        {title}
      </div>
      <p className={`font-['Be_Vietnam_Pro'] leading-[normal] min-w-full relative shrink-0 text-[15px] ${textColor} w-[min-content] whitespace-pre-wrap`}>
        {description}
      </p>
    </div>
  );
}
