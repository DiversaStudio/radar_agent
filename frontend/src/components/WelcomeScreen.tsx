import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { StopCircle, ArrowRight, Sparkles, Key, Brain, Check } from "lucide-react";
import { TechRadarV8 } from "../radar/radar V8";
import { TechCategoryChart } from "./TechCategoryChart";
import { AdoptionLevelsChart } from "./AdoptionLevelsChart";
import { SummarySection } from "./SummarySection";

interface WelcomeScreenProps {
  handleSubmit: (
    submittedInputValue: string,
    effort: string,
    apiConfig?: { apiKey: string; model: string }
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
  radarData?: any;
  activityEvents?: any[];
}

const PREDEFINED_THEMES = [
  {
    title: "AI Agents",
    description: "Autonomous agents, multi-agent systems, and intelligent automation",
    topics: "LangGraph, CrewAI, AutoGen, Agent frameworks, Multi-agent coordination, Tool calling"
  },
  {
    title: "AI Governance",
    description: "Principles and practices for responsible AI development and deployment",
    topics: "Fairness, Accountability, Transparency, Privacy, Security, Bias Mitigation"
  },
  {
    title: "Artificial Intelligence",
    description: "Latest frameworks, tools, and platforms for AI/ML development",
    topics: "TensorFlow, PyTorch, Hugging Face, OpenAI APIs, LangChain, MLOps"
  },
  {
    title: "Computer Vision",
    description: "Technologies and techniques for image and video analysis",
    topics: "OpenCV, TensorFlow, PyTorch, Keras, YOLO, GANs"
  },
  {
    title: "Data Engineering",
    description: "Big data processing, streaming, and analytics platforms",
    topics: "Apache Kafka, Spark, Airflow, dbt, Snowflake, Databricks"
  },
  {
    title: "Data Science",
    description: "Statistical analysis, predictive modeling, and data-driven insights",
    topics: "Pandas, NumPy, Scikit-learn, Jupyter, R, Statistical modeling, Feature engineering"
  },
  {
    title: "Data Visualization",
    description: "Tools and techniques for visualizing data and insights",
    topics: "Matplotlib, Seaborn, Plotly, D3.js, Tableau, Power BI"
  },
  {
    title: "Human-Machine Interaction",
    description: "Interfaces and systems for human-computer collaboration",
    topics: "UI/UX for AI, Conversational AI, Voice interfaces, Gesture recognition, Augmented reality"
  },
  {
    title: "Machine Learning",
    description: "Core ML algorithms, frameworks, and deployment strategies",
    topics: "Supervised learning, Unsupervised learning, Deep learning, Model deployment, AutoML"
  },
  {
    title: "ML-Ops",
    description: "Operations and lifecycle management for machine learning systems",
    topics: "MLflow, Kubeflow, Model versioning, CI/CD for ML, Model monitoring, Feature stores"
  },
  {
    title: "Multimodal AI",
    description: "Technologies and frameworks for integrating multiple AI modalities",
    topics: "Vision, Language, Audio, Robotics, Cross-Modal Learning"
  },
  {
    title: "Natural Language Processing",
    description: "Techniques and tools for processing and analyzing human language data",
    topics: "Tokenization, Named Entity Recognition, Sentiment Analysis, Transformers, BERT, GPT"
  },
  {
    title: "Spatial Data Science",
    description: "Tools and techniques for spatial data analysis and visualization",
    topics: "Geopandas, Folium, Shapely, Rasterio, Mapbox, Deck.gl"
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  handleSubmit,
  onCancel,
  isLoading,
  radarData,
  activityEvents = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [effort, setEffort] = useState("medium");
  const [logoHovered, setLogoHovered] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const agentStepsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new activity events are added
  useEffect(() => {
    if (agentStepsRef.current && activityEvents.length > 0) {
      agentStepsRef.current.scrollTop = agentStepsRef.current.scrollHeight;
    }
  }, [activityEvents]);

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const topic = selectedTheme || inputValue;
    if (!topic.trim()) return;
    
    // Validate API key
    if (!apiKey.trim()) {
      alert("Please enter your Gemini API key to proceed.");
      return;
    }
    
    if (!apiKey.startsWith("AIza")) {
      alert("Please enter a valid Gemini API key (should start with 'AIza').");
      return;
    }
    
    // Pass API configuration properly via callback
    handleSubmit(topic, effort, { apiKey, model: selectedModel });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handleThemeSelect = (themeName: string) => {
    setSelectedTheme(themeName);
    setInputValue(""); // Clear custom input when selecting a theme
  };

  const isSubmitDisabled = (!selectedTheme && !inputValue.trim()) || !apiKey.trim() || isLoading;

  return (
    <>
      {/* Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#0f0f0f', borderBottom: '1px solid #252525', height: '50px' }}>
        <div className="max-w-[100rem] mx-auto px-8 flex items-center justify-between h-full">
          {/* Left side - Title only */}
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', lineHeight: '50px' }}>
          Generative Tech Radar
          </div>
          
          {/* Right side - Logo */}
          <div className="flex items-center gap-4">
            <a 
              href="https://diversa.studio/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              onClick={() => setLogoHovered(!logoHovered)}
            >
              <img 
                src={logoHovered ? "./Artboard 2 copy 3.png" : "./Artboard 2 copy 4.png"}
                alt="Diversa Studio"
                className="h-8 w-auto transition-all duration-300 ease-in-out"
                onLoad={() => console.log("Logo loaded successfully")}
                onError={(e) => {
                  console.log("Logo failed to load:", e.currentTarget.src);
                  console.log("Trying alternative paths...");
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src.includes('./')) {
                    target.src = logoHovered ? "/Artboard 2 copy 3.png" : "/Artboard 2 copy 4.png";
                  } else if (target.src.includes('/Artboard')) {
                    target.src = logoHovered ? "Artboard 2 copy 3.png" : "Artboard 2 copy 4.png";
                  } else {
                    target.style.display = 'none';
                    const parent = target.parentElement!;
                    parent.innerHTML = '<div class="bg-blue-600 text-white px-2 py-1 rounded font-bold text-xs hover:bg-blue-700 transition-colors">Diversa</div>';
                  }
                }}
              />
            </a>
          </div>
        </div>
      </div>

      {/* Combined Instructions, Configuration, Radar, and Agent History section below header */}
      <div className="fixed top-12 left-0 right-0 bottom-0 z-40 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-700 overflow-y-auto shadow-lg" style={{ top: '50px' }}>
        <div className="max-w-[100rem] mx-auto px-10 py-4">
          {/* Explanatory text */}
          <div style={{ 
            fontSize: '17px', 
            fontWeight: '400', 
            color: '#a0a0a0', 
            marginTop: '16px', 
            marginBottom: '32px', 
            lineHeight: '1.6', 
            textAlign: 'left', 
            letterSpacing: '0.2px',
            maxWidth: '100%'
          }}>
            <div className="rounded-lg p-6" style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: '0'
            }}>
              Explore any technology domain with intelligent research that helps you discover current trends, tools, and innovations. Visualize findings through an interactive radar chart showing how technologies compare in adoption and industry relevance. Great for strategic planning, competitive analysis, or simply keeping up with the fast-moving tech landscape.
            </div>
          </div>

          {/* Unified Setup Configuration Box */}
          <form onSubmit={handleFormSubmit} className="mb-8">
            <div className="rounded-lg p-6" style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a'
            }}>
              {/* Main Title */}
              <h3 className="text-xl font-semibold mb-2 text-neutral-200">
                ⚙️ Setup
              </h3>
              
              {/* Main Subtitle */}
              <p className="text-sm mb-8 text-neutral-300">
                Connect your AI and choose what to explore
              </p>

              {/* API Configuration Row */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Model Selection - First */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-neutral-400" />
                    Choose AI Model
                  </label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-neutral-100" style={{ height: '40px' }}>
                      <SelectValue placeholder="Pick your preferred AI model ..." />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-700 border-neutral-600">
                      <SelectItem value="gemini-2.5-flash" className="text-neutral-100 hover:bg-neutral-600">
                        Claude opus-4-search
                      </SelectItem>
                      <SelectItem value="gemini-2.0-flash-exp" className="text-neutral-100 hover:bg-neutral-600">
                        OpenAI o3-search
                      </SelectItem>
                      <SelectItem value="gemini-1.5-pro" className="text-neutral-100 hover:bg-neutral-600">
                        Perplexity Sonar Pro High
                      </SelectItem>
                      <SelectItem value="gemini-1.5-flash" className="text-neutral-100 hover:bg-neutral-600">
                        Gemini 2.5 Pro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* API Key Input - Second */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4 text-neutral-400" />
                    Your API Key
                  </label>
                  <Input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key"
                    className="w-full bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500 font-mono"
                    style={{ height: '40px' }}
                    type="password"
                    autoComplete="off"
                  />
                </div>

                {/* Research Effort - Third */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-neutral-400" />
                    Research Depth
                  </label>
                  <Select value={effort} onValueChange={setEffort}>
                    <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-neutral-100" style={{ height: '40px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-700 border-neutral-600">
                      <SelectItem value="low" className="text-neutral-100 hover:bg-neutral-600">
                        Quick (2-3 min)
                      </SelectItem>
                      <SelectItem value="medium" className="text-neutral-100 hover:bg-neutral-600">
                        Balanced (3-5 min)
                      </SelectItem>
                      <SelectItem value="high" className="text-neutral-100 hover:bg-neutral-600">
                        Deep (5-7 min)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Research Topic Configuration Row */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Popular Domains Dropdown - First */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h18v18H3z"/>
                      <path d="M9 9h6v6H9z"/>
                      <path d="M3 9h6"/>
                      <path d="M15 9h6"/>
                      <path d="M9 3v6"/>
                      <path d="M9 15v6"/>
                    </svg>
                    Choose Your Research Area
                  </label>
                  <Select value={selectedTheme} onValueChange={handleThemeSelect}>
                    <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-neutral-100" style={{ height: '40px' }}>
                      <SelectValue placeholder="Choose a popular domain..." />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-700 border-neutral-600">
                      {PREDEFINED_THEMES.map((theme, index) => (
                        <SelectItem 
                          key={index} 
                          value={theme.title}
                          className="text-neutral-100 hover:bg-neutral-600 focus:bg-neutral-600"
                        >
                          <span className="font-medium">{theme.title}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Input - Second */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    Or Create Custom Topic
                  </label>
                  <Textarea
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (e.target.value.trim()) setSelectedTheme(""); // Clear selection when typing
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your custom technology domain..."
                    className="w-full bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-500 resize-none"
                    style={{ height: '40px', minHeight: '40px', maxHeight: '40px' }}
                    rows={1}
                  />
                </div>

                {/* Submit Button - Third */}
                <div className="lg:col-span-1">
                  <div className="block text-sm font-medium mb-2" style={{ height: '20px' }}>
                    {(apiKey.trim() && selectedModel && (selectedTheme || inputValue.trim())) ? (
                      <div className="flex items-center gap-2 text-neutral-300">
                        <Check className="h-4 w-4 text-green-400" />
                        Ready to research
                      </div>
                    ) : (
                      <span className="text-neutral-500">Complete setup to start</span>
                    )}
                  </div>
                  {isLoading ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onCancel}
                      className="w-full flex items-center justify-center gap-2"
                      style={{ height: '40px' }}
                    >
                      <StopCircle className="h-4 w-4" />
                      Stop Research
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                      style={{ height: '40px' }}
                    >
                      Start Research
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* Radar with Original Interactive Legend - Fixed container height */}
          <div className="w-full mb-6">
            <div className="min-h-[480px]" style={{ contain: 'layout size' }}>
              <TechRadarV8 radarData={radarData} isLoading={isLoading} />
            </div>
          </div>

          {/* Agent History and Charts Section - Responsive layout */}
          <div className="border-t border-neutral-700 pt-6 mt-8 sm:mt-16 lg:mt-64">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]" style={{ contain: 'layout' }}>
              
              {/* Compressed Agent History - Mobile full width, desktop left column */}
              <div className="lg:col-span-1 order-1 lg:order-1">
                <div className="bg-black border border-neutral-700 rounded-lg h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col" style={{ contain: 'layout size' }}>
                  <div className="p-4 sm:p-6 border-b border-neutral-700">
                    <h3 className="text-lg sm:text-xl font-semibold text-neutral-100 flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : 'bg-neutral-500'}`}></div>
                      Agent Process
                      {activityEvents.length > 0 && (
                        <span className="ml-auto text-xs sm:text-sm text-neutral-400 bg-neutral-800 px-2 sm:px-3 py-1 rounded-full">
                          {activityEvents.length} steps
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    {activityEvents.length > 0 ? (
                      <div 
                        ref={agentStepsRef}
                        className="h-full overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent"
                      >
                        {activityEvents.map((event, index) => (
                          <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-neutral-900/50 to-neutral-800/30 rounded-lg border border-neutral-700/50 hover:border-blue-500/30 transition-all duration-200">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-neutral-100 font-medium mb-1 sm:mb-2 text-sm sm:text-base leading-tight">{event.title}</div>
                              <div className="text-neutral-400 text-xs sm:text-sm leading-relaxed">{event.data}</div>
                            </div>
                            <div className="text-xs text-neutral-500 bg-neutral-800 px-2 sm:px-3 py-1 rounded-full flex-shrink-0 font-mono">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-4 sm:p-6">
                        <div className="text-center">
                          <div className="text-neutral-500 text-sm sm:text-base">
                            {isLoading ? (
                              <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                                <span>Initializing AI agents...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-700 rounded-full flex items-center justify-center">
                                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-neutral-500 rounded-full"></div>
                                </div>
                                <span>No active process</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technology Category Chart - Mobile full width, desktop middle column */}
              <div className="lg:col-span-1 order-2" style={{ contain: 'layout size' }}>
                <TechCategoryChart radarData={radarData} />
              </div>

              {/* Adoption Levels Chart - Mobile full width, desktop right column */}
              <div className="lg:col-span-1 order-3" style={{ contain: 'layout size' }}>
                <AdoptionLevelsChart radarData={radarData} />
              </div>
            </div>
          </div>

          {/* Summary Section - Always show */}
          <SummarySection radarData={radarData} isLoading={isLoading} />

          {/* Footer - Always show */}
          <div className="text-center mt-8 mb-6">
            <p className="text-xs text-neutral-500">
              AI agent Developed by Diversa
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
