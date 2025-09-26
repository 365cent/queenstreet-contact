"use client"

import * as React from "react"
import { X, ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
  group?: string
}

interface ComboBoxProps {
  options: Option[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyState?: string
  disabled?: boolean
}

export function ComboBoxMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  emptyState = "No results found.",
  disabled = false,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const optionMap = React.useMemo(() => {
    const map = new Map<string, Option>()
    for (const option of options) {
      map.set(option.value, option)
    }
    return map
  }, [options])

  const filteredOptions = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return options.filter((option) => {
      if (value.includes(option.value)) return false

      if (!term) return true

      const label = option.label.toLowerCase()
      const valueText = option.value.toLowerCase()
      return label.includes(term) || valueText.includes(term)
    })
  }, [options, searchTerm, value])

  const groupedOptions = React.useMemo(() => {
    const groups = new Map<string, Option[]>()
    for (const option of filteredOptions) {
      const groupName = option.group ?? ""
      if (!groups.has(groupName)) {
        groups.set(groupName, [])
      }
      groups.get(groupName)!.push(option)
    }
    return groups
  }, [filteredOptions])

  const handleSelect = React.useCallback(
    (optionValue: string) => {
      if (!value.includes(optionValue)) {
        onChange([...value, optionValue])
      }
      setSearchTerm("")
      setOpen(false)
      inputRef.current?.focus()
    },
    [onChange, value],
  )

  const removeValue = React.useCallback(
    (candidate: string) => {
      if (!value.includes(candidate)) return
      onChange(value.filter((item) => item !== candidate))
    },
    [onChange, value],
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && searchTerm === "" && value.length > 0) {
        event.preventDefault()
        onChange(value.slice(0, -1))
      } else if (event.key === "Enter" && searchTerm.trim()) {
        event.preventDefault()
        const firstOption = filteredOptions[0]
        if (firstOption) {
          handleSelect(firstOption.value)
        }
      }
    },
    [onChange, searchTerm, value, filteredOptions, handleSelect],
  )

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    if (!open) setOpen(true)
  }, [open])

  const selectedCount = value.length
  const displayPlaceholder = selectedCount === 0 ? placeholder : `${selectedCount} selected`

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 min-h-12 cursor-pointer hover:bg-gray-50 transition-colors duration-200 shadow-sm",
              disabled && "opacity-50 cursor-not-allowed bg-gray-50",
              open && "ring-2 ring-blue-500/20 border-blue-300"
            )}
            onClick={() => !disabled && setOpen(!open)}
          >
            <div className="flex flex-wrap gap-2 items-center flex-1">
              {value.map((item) => {
                const option = optionMap.get(item)
                const label = option?.label ?? item
                return (
                  <div
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    <span>{label}</span>
                    <div
                      className="rounded-full p-0.5 hover:bg-blue-100 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeValue(item)
                      }}
                      aria-label={`Remove ${label}`}
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </div>
                )
              })}
              {selectedCount === 0 && (
                <span className="text-gray-500 text-sm font-medium">{placeholder}</span>
              )}
            </div>
            <ChevronDown className={cn(
              "ml-3 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
              open && "rotate-180"
            )} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white border border-gray-200 rounded-lg shadow-lg" align="start">
          <div className="p-3 border-b border-gray-100">
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="h-9 border-gray-200 focus:border-blue-300 focus:ring-blue-500/20"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {emptyState}
              </div>
            ) : (
              <div className="p-1">
                {Array.from(groupedOptions.entries()).map(([groupName, entries]) => (
                  <div key={groupName || "__default"}>
                    {groupName && (
                      <div className="py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {groupName}
                      </div>
                    )}
                    {entries.map((option) => (
                      <div
                        key={option.value}
                        className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-sm text-gray-700 outline-none hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                        onClick={() => handleSelect(option.value)}
                      >
                        <span className="truncate font-medium">{option.label}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}


