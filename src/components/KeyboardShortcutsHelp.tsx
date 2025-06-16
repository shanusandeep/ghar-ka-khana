
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Keyboard, Command } from 'lucide-react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  description: string
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[]
}

const KeyboardShortcutsHelp = ({ shortcuts }: KeyboardShortcutsHelpProps) => {
  const [open, setOpen] = useState(false)

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = []
    if (shortcut.ctrlKey) keys.push('Ctrl')
    if (shortcut.altKey) keys.push('Alt')
    if (shortcut.shiftKey) keys.push('Shift')
    keys.push(shortcut.key.toUpperCase())
    return keys.join(' + ')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Command className="w-5 h-5" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
          {shortcuts.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No shortcuts available for this page
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default KeyboardShortcutsHelp
