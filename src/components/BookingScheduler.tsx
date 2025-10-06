import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Calendar, Clock, Users, Dumbbell, Heart, Zap, TrendingUp, ArrowLeft, CheckCircle2, AlertCircle, MapPin, CreditCard, X } from 'lucide-react'

interface ClassSchedule {
  id: number
  name: string
  instructor: string
  time: string
  duration: string
  spots: number
  maxSpots: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  icon: any
  description: string
  category: string
}

const MOCK_CLASSES: ClassSchedule[] = [
  {
    id: 1,
    name: 'Morning HIIT',
    instructor: 'Sarah Chen',
    time: '6:00 AM',
    duration: '45 min',
    spots: 8,
    maxSpots: 20,
    difficulty: 'Intermediate',
    icon: Zap,
    description: 'High-intensity interval training to kickstart your day',
    category: 'Cardio'
  },
  {
    id: 2,
    name: 'Yoga Flow',
    instructor: 'Maya Rodriguez',
    time: '8:00 AM',
    duration: '60 min',
    spots: 5,
    maxSpots: 15,
    difficulty: 'Beginner',
    icon: Heart,
    description: 'Gentle flow for flexibility and mindfulness',
    category: 'Wellness'
  },
  {
    id: 3,
    name: 'Strength Training',
    instructor: 'Marcus Johnson',
    time: '10:00 AM',
    duration: '50 min',
    spots: 12,
    maxSpots: 25,
    difficulty: 'Advanced',
    icon: Dumbbell,
    description: 'Build muscle and increase overall strength',
    category: 'Strength'
  },
  {
    id: 4,
    name: 'Spin Class',
    instructor: 'Alex Kim',
    time: '12:00 PM',
    duration: '45 min',
    spots: 3,
    maxSpots: 20,
    difficulty: 'Intermediate',
    icon: TrendingUp,
    description: 'Indoor cycling for endurance and fat burning',
    category: 'Cardio'
  },
  {
    id: 5,
    name: 'Evening Pilates',
    instructor: 'Emma Wilson',
    time: '5:30 PM',
    duration: '55 min',
    spots: 10,
    maxSpots: 18,
    difficulty: 'Beginner',
    icon: Heart,
    description: 'Core-focused workout for posture and stability',
    category: 'Wellness'
  },
  {
    id: 6,
    name: 'Boxing Bootcamp',
    instructor: 'Jake Martinez',
    time: '7:00 PM',
    duration: '60 min',
    spots: 6,
    maxSpots: 15,
    difficulty: 'Advanced',
    icon: Zap,
    description: 'High-energy boxing and conditioning workout',
    category: 'Strength'
  }
]

export default function BookingScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookedClasses, setBookedClasses] = useState<number[]>([])
  const [showBookingsModal, setShowBookingsModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleBookClass = (classId: number, className: string) => {
    if (bookedClasses.includes(classId)) {
      setBookedClasses(bookedClasses.filter(id => id !== classId))
    } else {
      setBookedClasses([...bookedClasses, classId])
    }
  }

  const getBookedClassesDetails = () => {
    return MOCK_CLASSES.filter(cls => bookedClasses.includes(cls.id))
  }

  const calculateTotal = () => {
    // Assume each class costs $15
    return bookedClasses.length * 15
  }

  const handlePayment = async () => {
    setIsProcessingPayment(true)
    
    // Simulate payment processing (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessingPayment(false)
    setPaymentSuccess(true)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setPaymentSuccess(false)
      setShowBookingsModal(false)
      setBookedClasses([])
    }, 3000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Intermediate': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Advanced': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const generateWeekDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  return (
    <div className="min-h-screen relative">
      {/* Bookings Modal */}
      <Dialog open={showBookingsModal} onOpenChange={setShowBookingsModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {isProcessingPayment ? (
            // Loading State
            <div className="py-16 px-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Processing Payment...</h3>
              <p className="text-muted-foreground">Please wait while we confirm your booking</p>
            </div>
          ) : paymentSuccess ? (
            // Success State
            <div className="py-16 px-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in-50">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-emerald-600 mb-2">Payment Received!</h3>
              <p className="text-lg text-muted-foreground mb-4">Your classes have been successfully booked</p>
              <p className="text-sm text-muted-foreground">
                You'll receive a confirmation email shortly
              </p>
            </div>
          ) : (
            // Normal Booking View
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  My Booked Classes
                </DialogTitle>
                <DialogDescription>
                  Review your bookings for {formatDate(selectedDate)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
            {getBookedClassesDetails().map((classItem) => {
              const Icon = classItem.icon
              const categoryColors = {
                'Cardio': 'from-orange-500 to-red-500',
                'Wellness': 'from-pink-500 to-purple-500',
                'Strength': 'from-blue-500 to-cyan-500'
              }

              return (
                <Card key={classItem.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${categoryColors[classItem.category as keyof typeof categoryColors]} shadow-md flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Class Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{classItem.name}</h3>
                            <p className="text-sm text-muted-foreground">{classItem.category}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookClass(classItem.id, classItem.name)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{classItem.time}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{classItem.duration}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Instructor: <span className="font-medium">{classItem.instructor}</span></span>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`${getDifficultyColor(classItem.difficulty)} border-2`}>
                              {classItem.difficulty}
                            </Badge>
                            <span className="text-lg font-bold">$15.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {getBookedClassesDetails().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No classes booked yet</p>
              </div>
            )}
          </div>

              {/* Total and Payment */}
              {bookedClasses.length > 0 && (
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-2xl">${calculateTotal()}.00</span>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowBookingsModal(false)}
                    >
                      Continue Browsing
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 gap-2"
                      onClick={handlePayment}
                    >
                      <CreditCard className="h-4 w-4" />
                      Confirm and Pay
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Fixed Success Message - Bottom Right */}
      {bookedClasses.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5">
          <Card className="border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 shadow-xl">
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-emerald-900">
                    {bookedClasses.length} Class{bookedClasses.length > 1 ? 'es' : ''} Booked
                  </p>
                  <p className="text-xs text-emerald-700">
                    Check in at the front desk 10 minutes before class
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-emerald-300 bg-white hover:bg-emerald-100 flex-shrink-0"
                  onClick={() => setShowBookingsModal(true)}
                >
                  View My Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Header */}
      <div className="border-b bg-white/70 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
                  <p className="text-sm text-muted-foreground">Book your next workout session</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Date Selector */}
        <Card className="border-2 shadow-md bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose when you'd like to attend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {generateWeekDates().map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString()
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`relative flex-shrink-0 rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                        : 'border-border bg-card hover:border-blue-400'
                    }`}
                  >
                    {isToday && (
                      <span className={`absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isSelected ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-600 text-white'
                      }`}>
                        Today
                      </span>
                    )}
                    <div className="min-w-[60px] text-center">
                      <p className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className={`mt-1 text-2xl font-bold ${isSelected ? 'text-white' : ''}`}>
                        {date.getDate()}
                      </p>
                      <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Display */}
        <div className="rounded-lg border-2 bg-white/60 backdrop-blur-sm px-4 py-3 shadow-sm">
          <p className="text-center text-sm font-medium">
            Showing classes for <span className="font-semibold text-foreground">{formatDate(selectedDate)}</span>
          </p>
        </div>

        {/* Class List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Available Classes</h2>
            <p className="text-sm text-muted-foreground">{MOCK_CLASSES.length} classes</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_CLASSES.map((classItem) => {
              const Icon = classItem.icon
              const isBooked = bookedClasses.includes(classItem.id)
              const spotsLeft = classItem.spots
              const isAlmostFull = spotsLeft <= 5
              const isFull = spotsLeft === 0
              
              // Define gradient colors for each category
              const categoryColors = {
                'Cardio': 'from-orange-500 to-red-500',
                'Wellness': 'from-pink-500 to-purple-500',
                'Strength': 'from-blue-500 to-cyan-500'
              }
              
              const categoryBgColors = {
                'Cardio': 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
                'Wellness': 'bg-gradient-to-br from-pink-500/10 to-purple-500/10',
                'Strength': 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
              }

              return (
                <Card 
                  key={classItem.id} 
                  className={`relative flex flex-col overflow-hidden transition-all hover:shadow-xl border-2 shadow-md bg-white/95 backdrop-blur-sm ${
                    isBooked ? 'ring-2 ring-emerald-500 shadow-lg' : ''
                  }`}
                >
                  {/* Gradient Top Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${categoryColors[classItem.category as keyof typeof categoryColors]}`} />
                  
                  <CardHeader className={`space-y-3 ${categoryBgColors[classItem.category as keyof typeof categoryBgColors]}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${categoryColors[classItem.category as keyof typeof categoryColors]} shadow-md`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg leading-none">{classItem.name}</CardTitle>
                          <CardDescription className="text-xs font-medium">
                            <span className={`bg-gradient-to-r ${categoryColors[classItem.category as keyof typeof categoryColors]} bg-clip-text text-transparent`}>
                              {classItem.category}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      {isBooked && (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Booked
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {classItem.description}
                    </p>
                  </CardHeader>

                  <CardContent className="flex flex-col space-y-4 flex-1">
                    {/* Instructor */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${categoryColors[classItem.category as keyof typeof categoryColors]} text-xs font-bold text-white shadow-md`}>
                        {classItem.instructor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Instructor</p>
                        <p className="font-medium">{classItem.instructor}</p>
                      </div>
                    </div>

                    {/* Time & Duration */}
                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className={`h-4 w-4 bg-gradient-to-r ${categoryColors[classItem.category as keyof typeof categoryColors]} bg-clip-text text-transparent`} />
                        <span className="font-semibold">{classItem.time}</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{classItem.duration}</span>
                    </div>

                    {/* Difficulty & Availability */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={`${getDifficultyColor(classItem.difficulty)} border-2 font-semibold`}>
                        {classItem.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className={`font-bold ${isAlmostFull ? 'text-orange-600' : 'text-foreground'}`}>
                          {spotsLeft}/{classItem.maxSpots}
                        </span>
                      </div>
                    </div>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-1" />

                    {/* Warning - Fixed height container */}
                    <div className="h-9">
                      {isAlmostFull && !isFull && !isBooked && (
                        <div className="flex items-center gap-2 rounded-md border-2 border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 text-xs font-semibold text-orange-700 shadow-sm">
                          <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                          <span>Only {spotsLeft} spots left!</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleBookClass(classItem.id, classItem.name)}
                      className={`w-full font-semibold shadow-md transition-all hover:scale-[1.02] ${
                        !isBooked && !isFull 
                          ? `bg-gradient-to-r ${categoryColors[classItem.category as keyof typeof categoryColors]} hover:opacity-90` 
                          : ''
                      }`}
                      variant={isBooked ? 'destructive' : isFull ? 'secondary' : 'default'}
                      disabled={isFull && !isBooked}
                    >
                      {isFull && !isBooked ? (
                        'Fully Booked'
                      ) : isBooked ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Cancel Booking
                        </>
                      ) : (
                        'Book Class'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Footer Info */}
        <Card className="border-2 border-dashed bg-white/70 backdrop-blur-sm shadow-sm">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
              <div className="space-y-1">
                <p className="font-medium">Need Help?</p>
                <p className="text-sm text-muted-foreground">Contact us at support@gymflow.com or call (555) 123-4567</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Fitness Street, New York, NY 10001</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}