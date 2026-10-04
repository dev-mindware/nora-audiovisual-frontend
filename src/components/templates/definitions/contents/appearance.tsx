"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Label,
  Icon,
  Separator,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SelectGroup } from "@radix-ui/react-select"

export function Appearance() {
  const { setTheme, theme } = useTheme()
  const [primaryColor, setPrimaryColor] = useState("#9956F6")
  const [font, setFont] = useState("Outfit")

  const themes = [
    { name: "Light", value: "light", img: "/themes/light.png" },
    { name: "Dark", value: "dark", img: "/themes/dark.png" },
    { name: "System", value: "system", img: "/themes/system.png" },
  ]

  useEffect(() => {
    const savedColor = localStorage.getItem("primary-color")
    const savedFont = localStorage.getItem("font-family")

    if (savedColor) {
      document.documentElement.style.setProperty("--primary", savedColor)
      setPrimaryColor(savedColor)
    }

    if (savedFont) {
      document.documentElement.style.setProperty("--font-family", savedFont)
      setFont(savedFont)
    }
  }, [])

  const handlePrimaryColorChange = (hex: string) => {
    document.documentElement.style.setProperty("--primary", hex)
    localStorage.setItem("primary-color", hex)
    setPrimaryColor(hex)
  }

  const handleFontChange = (fontName: string) => {
    const fontValue = `'${fontName}', sans-serif`
    document.documentElement.style.setProperty("--font-family", fontValue)
    localStorage.setItem("font-family", fontValue)
    setFont(fontName)
  }

  const restoreDefaults = () => {
    const defaultColor = "#9956F6"
    const defaultFont = "'Outfit', sans-serif"
    const defaultFontName = "Outfit"
    const defaultTheme = "system"

    document.documentElement.style.setProperty("--primary", defaultColor)
    document.documentElement.style.setProperty("--font-family", defaultFont)

    localStorage.removeItem("primary-color")
    localStorage.removeItem("font-family")
    localStorage.removeItem("mindware-theme")

    setPrimaryColor(defaultColor)
    setFont(defaultFontName)
    setTheme(defaultTheme)
  }

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="space-y-6 pb-8">
      {/* Visual Identity Group */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Identidade Visual</p>
        <Card className="bg-card rounded-xs border border-border shadow-none overflow-hidden divide-y divide-border p-0 gap-0">
          {/* Color Picker Item */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xs bg-primary/10 flex items-center justify-center">
                <Icon name="Palette" size={15} className="text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Cor Primária</p>
                <p className="text-[11px] text-muted-foreground">Cor de destaque da interface</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-xs border border-border shadow-none overflow-hidden relative cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{primaryColor}</span>
            </div>
          </div>

          {/* Font Selection Item */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xs bg-primary/10 flex items-center justify-center">
                <Icon name="Type" size={15} className="text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Tipografia</p>
                <p className="text-[11px] text-muted-foreground">Tipo de letra do sistema</p>
              </div>
            </div>
            <Select value={font} onValueChange={handleFontChange}>
              <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/40 border border-border rounded-xs">
                <SelectValue placeholder="Outfit" />
              </SelectTrigger>
              <SelectContent className="rounded-xs">
                <SelectGroup>
                  <SelectItem value="Outfit">Outfit</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Plus Jakarta Sans">Plus Jakarta</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Theme Selection Group */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Tema sugerido</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ name, value, img }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "group relative flex flex-col gap-2 p-2 rounded-xs bg-card border transition-all active:scale-98",
                theme === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              )}
            >
              <div className="relative aspect-[4/3] rounded-xs overflow-hidden border border-border bg-muted">
                <Image
                  src={img}
                  alt={name}
                  fill
                  className="object-cover"
                />
                {theme === value && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-xs bg-primary text-primary-foreground flex items-center justify-center">
                      <Icon name="Check" size={12} />
                    </div>
                  </div>
                )}
              </div>
              <p className={cn(
                "text-[10px] font-semibold text-center uppercase tracking-wider",
                theme === value ? "text-primary" : "text-muted-foreground"
              )}>{name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 flex justify-center">
        <Button 
          variant="ghost" 
          onClick={restoreDefaults}
          className="text-xs text-muted-foreground hover:text-foreground h-auto py-1.5 px-3 rounded-xs font-medium"
        >
          <Icon name="RotateCcw" size={12} className="mr-1.5" />
          Restaurar padrões
        </Button>
      </div>
    </div>
  )
}
