# Modern Date Picker Components

This directory contains modern, accessible date picker components built with React Day Picker and styled with our design system.

## Components

### 1. DatePicker
Single date selection with calendar popup.

```tsx
import { DatePicker } from "@/components/ui/date-picker"

// Basic usage
<DatePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  placeholder="Select a date"
/>

// With constraints
<DatePicker
  date={hireDate}
  onDateChange={setHireDate}
  placeholder="Select hire date"
  minDate={new Date('2020-01-01')}
  maxDate={new Date()}
/>
```

**Props:**
- `date?: Date` - Current selected date
- `onDateChange?: (date: Date | undefined) => void` - Date change callback
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Disable the picker
- `className?: string` - Additional CSS classes
- `align?: "start" | "center" | "end"` - Popover alignment
- `side?: "top" | "right" | "bottom" | "left"` - Popover side
- `minDate?: Date` - Minimum selectable date
- `maxDate?: Date` - Maximum selectable date

### 2. DateRangePicker
Date range selection (from/to dates).

```tsx
import { DateRangePicker } from "@/components/ui/date-picker"

<DateRangePicker
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
  placeholder="Select date range"
/>
```

**Props:**
- `dateRange?: { from: Date | undefined; to: Date | undefined }` - Current range
- `onDateRangeChange?: (range) => void` - Range change callback
- Plus all DatePicker props

### 3. TimePicker
Time selection (hours and minutes).

```tsx
import { TimePicker } from "@/components/ui/date-picker"

<TimePicker
  time={selectedTime}
  onTimeChange={setSelectedTime}
  placeholder="Select time"
/>
```

**Props:**
- `time?: string` - Current time in "HH:mm" format
- `onTimeChange?: (time: string) => void` - Time change callback
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Disable the picker
- `className?: string` - Additional CSS classes

### 4. DateTimePicker
Combined date and time selection.

```tsx
import { DateTimePicker } from "@/components/ui/date-picker"

<DateTimePicker
  datetime={selectedDateTime}
  onDateTimeChange={setSelectedDateTime}
  placeholder="Select date and time"
/>
```

**Props:**
- `datetime?: Date` - Current datetime
- `onDateTimeChange?: (datetime: Date | undefined) => void` - Datetime change callback
- Plus DatePicker props for date constraints

## React Hook Form Integration

### With FormField (Recommended)

```tsx
<FormField
  control={form.control}
  name="hireDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Hire Date</FormLabel>
      <FormControl>
        <DatePicker
          date={field.value}
          onDateChange={field.onChange}
          placeholder="Select hire date"
          maxDate={new Date()}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### With register/setValue

```tsx
const { register, setValue, watch } = useForm()

<DatePicker
  date={watch('expiryDate') ? new Date(watch('expiryDate')) : undefined}
  onDateChange={(date) => setValue('expiryDate', date?.toISOString().split('T')[0] || '')}
  placeholder="Select expiry date"
/>
```

## Zod Schema Integration

Update your schemas to use Date objects:

```tsx
// Before
hireDate: z.string().min(1, "Date is required")

// After
hireDate: z.date({ required_error: "Date is required" })

// Optional dates
expiryDate: z.date().optional()
```

## State Management

Update your state to use Date objects:

```tsx
// Before
const [date, setDate] = useState('')

// After
const [date, setDate] = useState<Date | undefined>(undefined)

// For ranges
const [dateRange, setDateRange] = useState<{
  from: Date | undefined
  to: Date | undefined
}>({ from: undefined, to: undefined })
```

## Styling

The components inherit the application's design system and support:

- Light/dark theme
- Custom border colors via className
- Responsive design
- Focus states
- Disabled states
- Error states (through form integration)

## Accessibility Features

- Keyboard navigation
- Screen reader support
- ARIA labels and descriptions
- Focus management
- High contrast support

## Migration from HTML Date Inputs

1. **Import the component:**
   ```tsx
   import { DatePicker } from "@/components/ui/date-picker"
   ```

2. **Update the input:**
   ```tsx
   // Before
   <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

   // After
   <DatePicker date={date} onDateChange={setDate} placeholder="Select date" />
   ```

3. **Update state and schema** (see sections above)

## Examples

### Employee Hire Date
```tsx
<DatePicker
  date={hireDate}
  onDateChange={setHireDate}
  placeholder="Select hire date"
  maxDate={new Date()} // Can't hire for future dates
  className="h-12 text-lg border-2 focus:border-emerald-500"
/>
```

### Product Expiry Date
```tsx
<DatePicker
  date={expiryDate}
  onDateChange={setExpiryDate}
  placeholder="Select expiry date"
  minDate={new Date()} // Can't expire in the past
/>
```

### Report Date Range
```tsx
<DateRangePicker
  dateRange={reportRange}
  onDateRangeChange={setReportRange}
  placeholder="Select report period"
  maxDate={new Date()}
/>
```

### Event DateTime
```tsx
<DateTimePicker
  datetime={eventDateTime}
  onDateTimeChange={setEventDateTime}
  placeholder="Select event date and time"
  minDate={new Date()}
/>
```