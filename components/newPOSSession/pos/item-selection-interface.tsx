"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Grid3X3, ImageIcon, Package, Percent, Plus, Scan, Search, Star, Tag } from "lucide-react"

interface ItemCategory {
  id: string
  title: string
}

interface ItemInventoryLevel {
  quantityOnHand?: number
}

interface SelectableItem {
  id: string
  name?: string
  nameEn?: string
  sku?: string
  sellingPrice?: number | string
  category?: { id: string } | null
  inventoryLevel?: ItemInventoryLevel | ItemInventoryLevel[] | null
}

interface ItemSelectionInterfaceProps {
  categories?: ItemCategory[]
  items?: SelectableItem[]
  filteredItems?: SelectableItem[]
  selectedCategory: string
  favorites: string[]
  recentItems: string[]
  discountPercent: number
  searchTerm: string
  setSelectedCategory: (categoryId: string) => void
  setDiscountPercent: (discountPercent: number) => void
  setSearchTerm: (searchTerm: string) => void
  addToCart: (item: SelectableItem) => void
  toggleFavorite: (itemId: string) => void
}

const getStockLevel = (item: SelectableItem) => {
  if (!item.inventoryLevel) return 0

  if (Array.isArray(item.inventoryLevel)) {
    return item.inventoryLevel[0]?.quantityOnHand ?? 0
  }

  return item.inventoryLevel.quantityOnHand ?? 0
}

export function ItemSelectionInterface({
  categories = [],
  items = [],
  filteredItems = [],
  selectedCategory,
  favorites,
  recentItems,
  discountPercent,
  searchTerm,
  setSelectedCategory,
  setDiscountPercent,
  setSearchTerm,
  addToCart,
  toggleFavorite,
}: ItemSelectionInterfaceProps) {
  const getCategoryIcon = () => Tag

  return (
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-3 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Select Category</Label>
            <Badge variant="secondary" className="ml-auto">
              {categories.length} categories
            </Badge>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              <Button
                type="button"
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105"
                onClick={() => setSelectedCategory("all")}
              >
                <Grid3X3 className="h-4 w-4" />
                All Items
                <Badge variant="secondary" className="ml-1">
                  {items.length}
                </Badge>
              </Button>
              {categories.map((category) => {
                const IconComponent = getCategoryIcon()
                const categoryItemCount = items.filter((item) => item.category?.id === category.id).length

                return (
                  <Button
                    key={category.id}
                    type="button"
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.title}
                    <Badge variant="secondary" className="ml-1">
                      {categoryItemCount}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => setSelectedCategory("favorites")}
          >
            <Star className="h-4 w-4" />
            Favorites ({favorites.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => setSelectedCategory("recent")}
          >
            <Clock className="h-4 w-4" />
            Recent ({recentItems.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => setDiscountPercent(discountPercent > 0 ? 0 : 10)}
          >
            <Percent className="h-4 w-4" />
            {discountPercent > 0 ? `${discountPercent}% OFF` : "Add Discount"}
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-input"
              placeholder="Search by name, SKU, or scan barcode..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="button" variant="outline" size="icon" className="hover:bg-emerald-50 bg-transparent">
            <Scan className="h-4 w-4" />
          </Button>
        </div>

        {selectedCategory !== "all" && selectedCategory !== "favorites" && selectedCategory !== "recent" && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            {(() => {
              const category = categories.find((currentCategory) => currentCategory.id === selectedCategory)
              if (!category) return null

              const IconComponent = getCategoryIcon()
              return (
                <>
                  <IconComponent className="h-5 w-5 text-primary" />
                  <span className="font-medium">Showing {category.title}</span>
                  <Badge variant="secondary">{filteredItems.length} items</Badge>
                </>
              )
            })()}
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const stockLevel = getStockLevel(item)
              const itemName = item.nameEn || item.name || "Unnamed item"

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col p-3 rounded-lg border border-border hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 ${stockLevel <= 5 ? "border-orange-200 bg-orange-50/50" : ""} ${stockLevel === 0 ? "border-red-200 bg-red-50/50 opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => stockLevel > 0 && addToCart(item)}
                >
                  <div className="relative mb-2">
                    <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    {favorites.includes(item.id) && (
                      <Star className="absolute top-1 right-1 h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 left-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                    >
                      <Star
                        className={`h-3 w-3 ${favorites.includes(item.id) ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                      />
                    </Button>
                  </div>
                  <div className="flex-1 mb-3">
                    <div className="font-medium text-card-foreground text-sm leading-tight mb-1">{itemName}</div>
                    <div className="text-xs text-muted-foreground mb-1">SKU: {item.sku || "N/A"}</div>
                    <div className="flex items-center gap-1 mb-1">
                      <div
                        className={`text-xs ${stockLevel <= 5 ? "text-orange-600 font-medium" : "text-muted-foreground"} ${stockLevel === 0 ? "text-red-600 font-medium" : ""}`}
                      >
                        Stock: {stockLevel}
                      </div>
                      {stockLevel <= 5 && stockLevel > 0 && (
                        <Badge variant="outline" className="text-xs px-1 py-0 text-orange-600 border-orange-200">
                          Low
                        </Badge>
                      )}
                    </div>
                    <Progress value={Math.min((stockLevel / 20) * 100, 100)} className="h-1 mb-2" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="font-bold text-primary text-lg">${item.sellingPrice ?? 0}</div>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full transition-all hover:bg-emerald-600"
                      disabled={stockLevel === 0}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {stockLevel === 0 ? "Out of Stock" : "Add"}
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-4 flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No items found</p>
              <p className="text-sm text-muted-foreground">
                {selectedCategory === "all" ? "Try adjusting your search terms" : "Try selecting a different category"}
              </p>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  )
}
