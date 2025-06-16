
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Image, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface MenuItemImageUploadProps {
  currentImageUrl?: string
  onImageChange: (imageUrl: string) => void
  itemName: string
}

const MenuItemImageUpload = ({ currentImageUrl, onImageChange, itemName }: MenuItemImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      })
      return
    }

    setUploading(true)

    try {
      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewUrl(result)
        onImageChange(result)
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageChange('')
    toast({
      title: "Success",
      description: "Image removed successfully"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Image className="w-4 h-4" />
          <span>{currentImageUrl ? 'Change Image' : 'Add Image'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Image for {itemName}</DialogTitle>
          <DialogDescription>
            Choose an image to represent this menu item. Supported formats: JPG, PNG, GIF (max 5MB)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current/Preview Image */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt={itemName}
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Select Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Browse'}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MenuItemImageUpload
