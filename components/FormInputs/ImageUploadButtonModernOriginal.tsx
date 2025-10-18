"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { UploadButton } from "@/lib/uploadthing"
import { ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface ImageUploadButtonProps {
  title: string
  imageUrl: string
  setImageUrl: (url: string) => void
  endpoint: any // This should match your OurFileRouter endpoint keys
  maxFileSize?: string
  acceptedFileTypes?: string[]
  className?: string
  onUploadStart?: () => void
  onUploadComplete?: () => void
  onUploadError?: () => void
}

const ImageUploadButtonModernOriginal = ({
  title,
  imageUrl,
  setImageUrl,
  endpoint,
  maxFileSize = "4MB",
  acceptedFileTypes = ["image/*"],
  className = "",
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: ImageUploadButtonProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUploadComplete = (res: any[]) => {
    if (res && res[0]) {
      setImageUrl(res[0].url)
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully.",
      })
    }
    setIsUploading(false)
    onUploadComplete?.()
  }

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error)
    toast({
      title: "Upload failed",
      description: error.message || "Something went wrong during upload.",
      variant: "destructive",
    })
    setIsUploading(false)
    onUploadError?.()
  }

  const handleRemoveImage = () => {
    setImageUrl("")
    toast({
      title: "Image removed",
      description: "The image has been removed successfully.",
    })
  }

  const hasImage = imageUrl && imageUrl !== ""

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Preview */}
        <div className="relative group">
          {hasImage ? (
            <div className="relative">
              <Image
                alt={title}
                className="h-48 w-full rounded-lg object-cover border-2 border-dashed border-transparent transition-all duration-200"
                height={300}
                src={imageUrl || "/placeholder.svg"}
                width={300}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <Button variant="destructive" size="sm" onClick={handleRemoveImage} className="gap-2">
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-48 w-full rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center transition-colors duration-200 hover:border-muted-foreground/50 hover:bg-muted/80">
              <div className="text-center space-y-2">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No image uploaded</p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="space-y-2">
          <UploadButton
            endpoint={endpoint}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={() => {
              setIsUploading(true)
              onUploadStart?.()
            }}
            appearance={{
              button:
                "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ut-ready:bg-primary ut-uploading:bg-primary/80 ut-uploading:cursor-not-allowed",
              allowedContent: "text-xs text-muted-foreground text-center mt-2",
              container: "w-full",
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return "Uploading..."
                if (ready) return hasImage ? "Replace Image" : "Upload Image"
                return "Getting ready..."
              },
              allowedContent({ ready, fileTypes, isUploading }) {
                if (!ready) return "Preparing upload..."
                if (isUploading) return "Uploading your image..."
                return `Accepted: ${acceptedFileTypes.join(", ")} (max ${maxFileSize})`
              },
            }}
          />

          {/* Upload Info */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Drag and drop or click to upload</p>
            <p>Maximum file size: {maxFileSize}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ImageUploadButtonModernOriginal
