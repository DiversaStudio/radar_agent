import { useState } from "react";
import { Button } from "./ui/button";
import { Download, FileText, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface SummarySectionProps {
  radarData: any;
  isLoading?: boolean;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ radarData, isLoading = false }) => {
  const [copied, setCopied] = useState(false);

  // Show placeholder section when no data or loading
  if (!radarData?.summary_report) {
    return (
      <div className="border-t border-neutral-700 pt-8 mt-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                Research Report
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base">
                {isLoading 
                  ? "AI agent is getting insights and preparing the report..."
                  : "Generate a technology radar to see detailed analysis and insights"
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                disabled
                variant="outline"
                size="sm"
                className="border-neutral-600 text-neutral-500 bg-transparent opacity-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Summary
              </Button>
              <Button
                disabled
                className="bg-blue-600 text-white opacity-50"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Placeholder Content */}
          <Card className="bg-black border-neutral-700">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <div className="space-y-2">
                      <p className="text-neutral-300 text-base sm:text-lg">Generating insights...</p>
                      <p className="text-neutral-500 text-sm">
                        AI agent is evaluating technologies and preparing the report
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-8 w-8 text-neutral-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-neutral-300 text-base sm:text-lg">No analysis available</p>
                      <p className="text-neutral-500 text-sm">
                        Start building a technology radar to see AI-powered research summary, strategic insights, and downloadable report
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Function to add logo to header with optimized horizontal logos
  const addLogoToHeader = async () => {
    try {
      // Try multiple logo paths, using Artboard logos for PDF display
      const logoOptions = [
        '/Artboard 2 copy 4.png',
        '/Artboard 2 copy 3.png',
        './Artboard 2 copy 4.png',
        './Artboard 2 copy 3.png',
        'Artboard 2 copy 4.png',
        'Artboard 2 copy 3.png'
      ];
      
      let logoResponse: Response | null = null;
      
      for (const path of logoOptions) {
        try {
          logoResponse = await fetch(path);
          if (logoResponse.ok) {
            console.log(`Logo loaded successfully from: ${path}`);
            break;
          }
        } catch (fetchError) {
          console.warn(`Failed to fetch logo from ${path}:`, fetchError);
        }
      }
      
      if (!logoResponse || !logoResponse.ok) {
        throw new Error('Logo not found in any path');
      }
      
      const logoBlob = await logoResponse.blob();
      
      // Ensure we have a valid image blob
      if (!logoBlob.type.startsWith('image/')) {
        throw new Error('Invalid image type');
      }
      
      // Use original logo without resizing for best quality
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Use original dimensions
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataURL = canvas.toDataURL('image/png');
            console.log(`Logo loaded at original size: ${width}x${height}`);
            resolve(dataURL);
          } else {
            reject(new Error('Cannot get canvas context'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(logoBlob);
      });
    } catch (error) {
      console.error('Failed to load logo:', error);
      throw error;
    }
  };

  // Function to add header to each page
  const addHeaderToPage = async (doc: jsPDF) => {
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add header with app-matching background color
      const headerHeight = 22; // Slightly taller header for better proportions
      doc.setFillColor(15, 15, 15); // #0f0f0f color to match app header exactly
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Try to add logo
      try {
        const logoDataURL = await addLogoToHeader();
        
        // Reduced logo size for better proportions with text
        const logoHeight = 8; // Reduced from 10 to 8 for better balance
        const logoWidth = 10; // Reduced from 12 to 10 to maintain good proportions
        const logoX = pageWidth - logoWidth - 12; // Right side with proper margin
        const logoY = (headerHeight - logoHeight) / 2; // Center vertically in header
        
        doc.addImage(logoDataURL, 'PNG', logoX, logoY, logoWidth, logoHeight);
        console.log('Logo added to PDF header successfully');
      } catch (logoError) {
        console.warn('Failed to add logo to header:', logoError);
        
        // Text fallback - add "DIVERSA" text in the logo position
        doc.setFontSize(14); // Match increased main title font size
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        const fallbackText = "DIVERSA";
        const fallbackX = pageWidth - 45;
        doc.text(fallbackText, fallbackX, headerHeight / 2 + 2); // Align with main title text
      }
      
      // Add title text on the left side - increased font size for better prominence
      doc.setFontSize(14); // Increased from 12pt to 14pt for better visual balance
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Generative Tech Radar Report', 12, headerHeight / 2 + 2); // Centered vertically with proper margin
      
      // Reset text color for document body
      doc.setTextColor(0, 0, 0);
      
    } catch (error) {
      console.error('Error adding header:', error);
      // Continue without header if there's an error
    }
  };

  // Function to justify text manually since jsPDF doesn't support justify alignment
  const justifyText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number) => {
    const words = text.trim().split(' ');
    if (words.length <= 1) {
      doc.text(text, x, y);
      return;
    }

    // Calculate total text width without extra spaces
    const textWidth = doc.getTextWidth(words.join(' '));
    
    // If text is already close to max width, don't justify
    if (textWidth >= maxWidth * 0.85) {
      doc.text(text, x, y);
      return;
    }

    // Calculate extra space to distribute
    const extraSpace = maxWidth - textWidth;
    const gaps = words.length - 1;
    const spacePerGap = extraSpace / gaps;

    // Draw each word with calculated spacing
    let currentX = x;
    for (let i = 0; i < words.length; i++) {
      doc.text(words[i], currentX, y);
      if (i < words.length - 1) {
        currentX += doc.getTextWidth(words[i]) + doc.getTextWidth(' ') + spacePerGap;
      }
    }
  };

  // Function to process Markdown text for PDF formatting
  const processMarkdownForPDF = (text: string, doc: jsPDF, startY: number, pageWidth: number, pageHeight: number, margin: number, lineHeight: number) => {
    let yPosition = startY;
    const lines = text.split('\n');
    
    for (let line of lines) {
      // Skip empty lines but add spacing
      if (line.trim() === '') {
        yPosition += lineHeight * 0.5;
        continue;
      }
      
      // Check for page break
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      // Process different markdown elements
      if (line.startsWith('# ')) {
        // Main heading (H1)
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const headingText = line.substring(2);
        doc.text(headingText, margin, yPosition);
        yPosition += lineHeight * 1.3; // Reduced from 1.8 to 1.3
        
      } else if (line.startsWith('## ')) {
        // Sub heading (H2)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const headingText = line.substring(3);
        doc.text(headingText, margin, yPosition);
        yPosition += lineHeight * 1.2; // Reduced from 1.5 to 1.2
        
      } else if (line.startsWith('### ')) {
        // Sub-sub heading (H3)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const headingText = line.substring(4);
        doc.text(headingText, margin, yPosition);
        yPosition += lineHeight * 1.1; // Reduced from 1.3 to 1.1
        
      } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold text
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const boldText = line.substring(2, line.length - 2);
        const wrappedLines = doc.splitTextToSize(boldText, pageWidth - 2 * margin);
        for (const wrappedLine of wrappedLines) {
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(wrappedLine, margin, yPosition);
          yPosition += lineHeight;
        }
        
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        // Bullet points
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const bulletText = line.startsWith('- ') ? line.substring(2) : line.substring(2);
        const wrappedLines = doc.splitTextToSize(`• ${bulletText}`, pageWidth - 2 * margin);
        for (const wrappedLine of wrappedLines) {
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(wrappedLine, margin + 5, yPosition);
          yPosition += lineHeight;
        }
        
      } else {
        // Regular paragraph text - with custom justification
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        // Handle bold text within paragraphs
        let processedLine = line;
        const boldPattern = /\*\*(.*?)\*\*/g;
        
        // For now, just remove markdown bold formatting in regular text
        // (More complex inline formatting would require more sophisticated parsing)
        processedLine = processedLine.replace(boldPattern, '$1');
        
        const wrappedLines = doc.splitTextToSize(processedLine, pageWidth - 2 * margin);
        for (let i = 0; i < wrappedLines.length; i++) {
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          
          const wrappedLine = wrappedLines[i];
          // Apply custom justification for all lines except the last line of a paragraph
          const isLastLineOfParagraph = i === wrappedLines.length - 1;
          
          if (!isLastLineOfParagraph && wrappedLine.trim().length > 0) {
            // Use custom justification
            justifyText(doc, wrappedLine, margin, yPosition, pageWidth - 2 * margin);
          } else {
            // Left align the last line of paragraph or short lines
            doc.text(wrappedLine, margin, yPosition);
          }
          yPosition += lineHeight;
        }
      }
    }
    
    return yPosition;
  };

  const handleDownloadSummary = async () => {
    const doc = new jsPDF();
    
    // Add header with logo and colored background
    try {
      await addHeaderToPage(doc);
    } catch (error) {
      console.error('Failed to add header:', error);
      // Continue with PDF generation even if header fails
    }
    
    // Set up the document
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = 35; // Reduced spacing after header banner

    // Process summary text with Markdown formatting (no additional titles or metadata)
    const summaryText = radarData.summary_report;
    yPosition = processMarkdownForPDF(summaryText, doc, yPosition, pageWidth, pageHeight, margin, lineHeight);

    // Add spacing after summary
    yPosition += lineHeight;
    if (yPosition + lineHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Technology List', margin, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    radarData.radar_data.forEach((tech: any, index: number) => {
      if (yPosition + lineHeight * 2 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      const techLine = `${index + 1}. ${tech.name} (${tech.quadrant} - ${tech.ring}) - Score: ${tech.score}/10`;
      const techLines = doc.splitTextToSize(techLine, pageWidth - 2 * margin);
      
      for (const line of techLines) {
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
      
      // Add link if available
      if (tech.source_url) {
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(0, 0, 255); // Blue color for link
        const linkLine = `   Link: ${tech.source_url}`;
        const linkLines = doc.splitTextToSize(linkLine, pageWidth - 2 * margin);
        for (const linkLine of linkLines) {
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(linkLine, margin, yPosition);
          yPosition += lineHeight;
        }
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
      }
      
      yPosition += 2; // Add small spacing between technologies
    });

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    
    // Left side footer text
    doc.text('AI-generated', margin, footerY);
    
    // Right side footer text
    const rightMargin = pageWidth - margin;
    doc.text('Designed by Diversa', rightMargin, footerY, { align: 'right' });

    // Save the PDF
    doc.save(`${radarData.topic.replace(/\s+/g, '_')}_radar_report.pdf`);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(radarData.summary_report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  return (
    <div className="border-t border-neutral-700 pt-8 mt-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              Research Report
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base">
              Technology trends and strategic recommendations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCopySummary}
              variant="outline"
              size="sm"
              className="border-neutral-600 hover:border-neutral-500 text-neutral-300 hover:text-white bg-transparent hover:bg-neutral-800"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Summary
                </>
              )}
            </Button>
            <Button
              onClick={handleDownloadSummary}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Summary Content */}
        <Card className="bg-black border-neutral-700">
          <CardContent>
            <ScrollArea className="h-64 sm:h-96 w-full">
              <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  className="text-neutral-200 leading-relaxed"
                  components={{
                    h1: ({children}) => <h1 className="text-xl font-bold text-white mb-4 mt-6 first:mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold text-white mb-3 mt-5">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-medium text-white mb-2 mt-4">{children}</h3>,
                    h4: ({children}) => <h4 className="text-sm font-medium text-gray-200 mb-2 mt-3">{children}</h4>,
                    p: ({children}) => <p className="text-neutral-200 mb-3 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-neutral-200">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-neutral-200">{children}</ol>,
                    li: ({children}) => <li className="text-neutral-200 leading-relaxed">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                    em: ({children}) => <em className="italic text-gray-300">{children}</em>,
                    code: ({children}) => <code className="bg-neutral-800 text-blue-300 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                    pre: ({children}) => <pre className="bg-neutral-800 text-blue-300 p-3 rounded-lg overflow-x-auto mb-3 text-sm">{children}</pre>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-3 bg-neutral-900 rounded-r">{children}</blockquote>,
                    hr: () => <hr className="border-neutral-600 my-4" />,
                    a: ({href, children}) => <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                  }}
                >
                  {radarData.summary_report}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
