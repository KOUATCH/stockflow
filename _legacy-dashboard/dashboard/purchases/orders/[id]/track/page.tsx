"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Phone,
  Mail,
  Truck,
  User,
  AlertCircle,
  Navigation,
  Star,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

// Mock tracking data
const mockTrackingData = {
  orderNumber: "PO-2024-001",
  trackingNumber: "TRK-2024-001-TC",
  carrier: "FastShip Logistics",
  carrierPhone: "+1-800-FASTSHIP",
  carrierEmail: "tracking@fastship.com",
  currentStatus: "delivered",
  estimatedDelivery: new Date("2024-11-18"),
  actualDelivery: new Date("2024-11-18"),

  // Shipment details
  shipment: {
    origin: {
      name: "TechCorp Warehouse",
      address: "123 Innovation Drive",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102"
    },
    destination: {
      name: "StockFlow Solutions",
      address: "456 Business Plaza",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105"
    },
    packageCount: 3,
    totalWeight: "45.2 lbs",
    dimensions: "24x18x12 inches",
    service: "Express Delivery",
    instructions: "Deliver to loading dock. Contact John Smith at +1-555-987-6543"
  },

  // Tracking events
  events: [
    {
      date: new Date("2024-11-18T14:30:00"),
      status: "Delivered",
      description: "Package delivered successfully to recipient",
      location: "San Francisco, CA 94105",
      signature: "J. Smith",
      isCompleted: true
    },
    {
      date: new Date("2024-11-18T11:15:00"),
      status: "Out for Delivery",
      description: "Package is on vehicle for delivery",
      location: "San Francisco, CA - Local Facility",
      driver: "Mike Rodriguez",
      vehicle: "Truck #FS-245",
      isCompleted: true
    },
    {
      date: new Date("2024-11-18T08:00:00"),
      status: "Arrived at Facility",
      description: "Package arrived at local delivery facility",
      location: "San Francisco, CA - Distribution Center",
      isCompleted: true
    },
    {
      date: new Date("2024-11-17T22:30:00"),
      status: "In Transit",
      description: "Package in transit to delivery facility",
      location: "Oakland, CA - Sorting Facility",
      isCompleted: true
    },
    {
      date: new Date("2024-11-17T18:45:00"),
      status: "Departed Facility",
      description: "Package departed from origin facility",
      location: "San Francisco, CA - Origin Facility",
      isCompleted: true
    },
    {
      date: new Date("2024-11-17T15:20:00"),
      status: "Picked Up",
      description: "Package picked up from shipper",
      location: "TechCorp Solutions - San Francisco, CA",
      driver: "Sarah Johnson",
      isCompleted: true
    },
    {
      date: new Date("2024-11-16T16:30:00"),
      status: "Label Created",
      description: "Shipping label created and ready for pickup",
      location: "TechCorp Solutions - San Francisco, CA",
      isCompleted: true
    }
  ],

  // Delivery confirmation
  deliveryConfirmation: {
    recipient: "John Smith",
    signatureUrl: "/api/signatures/TRK-2024-001-TC.png",
    deliveryLocation: "Loading Dock - Building A",
    photos: [
      "/api/delivery-photos/TRK-2024-001-TC-1.jpg",
      "/api/delivery-photos/TRK-2024-001-TC-2.jpg"
    ]
  }
};

const getStatusIcon = (status: string, isCompleted: boolean) => {
  if (isCompleted) {
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  }

  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "out for delivery":
      return <Truck className="w-5 h-5 text-blue-600" />;
    case "in transit":
      return <Navigation className="w-5 h-5 text-blue-600" />;
    case "picked up":
      return <Package className="w-5 h-5 text-orange-600" />;
    default:
      return <Clock className="w-5 h-5 text-slate-400" />;
  }
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    delivered: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    "out for delivery": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    "in transit": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400",
    "picked up": "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
    "label created": "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
  };

  return (
    <Badge variant="outline" className={statusConfig[status.toLowerCase() as keyof typeof statusConfig]}>
      {status}
    </Badge>
  );
};

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export default function TrackDeliveryPage() {
  const params = useParams();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tracking = mockTrackingData;

  const handleRefreshTracking = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const progressPercentage = tracking.currentStatus === "delivered" ? 100 :
                            tracking.currentStatus === "out for delivery" ? 85 :
                            tracking.currentStatus === "in transit" ? 60 :
                            tracking.currentStatus === "picked up" ? 40 : 20;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/purchases/orders/${params.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Order Details
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Track Delivery
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {tracking.orderNumber} • {tracking.trackingNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleRefreshTracking}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4" />
                Contact Carrier
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Tracking Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Current Status
                  </CardTitle>
                  {getStatusBadge(tracking.currentStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Delivery Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Estimated Delivery</label>
                      <p className="text-slate-900 dark:text-white font-medium">{formatDate(tracking.estimatedDelivery)}</p>
                    </div>
                    {tracking.actualDelivery && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Actual Delivery</label>
                        <p className="text-slate-900 dark:text-white font-medium">{formatDate(tracking.actualDelivery)}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Latest Update</h4>
                    <div className="flex items-start gap-3">
                      {getStatusIcon(tracking.events[0].status, tracking.events[0].isCompleted)}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{tracking.events[0].status}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{tracking.events[0].description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {formatDateTime(tracking.events[0].date)} • {tracking.events[0].location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Tracking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tracking.events.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(event.status, event.isCompleted)}
                        {index < tracking.events.length - 1 && (
                          <div className={`w-px h-12 mt-2 ${event.isCompleted ? 'bg-green-300' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-medium ${event.isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                              {event.status}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              {formatDateTime(event.date)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {event.location}
                            </p>
                            {event.driver && (
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                Driver: {event.driver} {event.vehicle && `• ${event.vehicle}`}
                              </p>
                            )}
                            {event.signature && (
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                                Signed by: {event.signature}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDateTime(event.date).split(' ')[1]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Confirmation */}
            {tracking.currentStatus === "delivered" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Delivery Confirmation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Received By</label>
                        <p className="text-slate-900 dark:text-white font-medium">{tracking.deliveryConfirmation.recipient}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Delivery Location</label>
                        <p className="text-slate-900 dark:text-white font-medium">{tracking.deliveryConfirmation.deliveryLocation}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h5 className="font-medium text-slate-900 dark:text-white mb-2">Digital Signature</h5>
                        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                          <p className="text-sm text-slate-500 dark:text-slate-500">Signature captured</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 w-full">
                          View Signature
                        </Button>
                      </div>

                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h5 className="font-medium text-slate-900 dark:text-white mb-2">Delivery Photos</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {tracking.deliveryConfirmation.photos.map((photo, index) => (
                            <div key={index} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                              <p className="text-xs text-slate-500 dark:text-slate-500">Photo {index + 1}</p>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 w-full">
                          View All Photos
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Carrier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Carrier Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{tracking.carrier}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Express Delivery Service</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{tracking.carrierPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{tracking.carrierEmail}</span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Tracking #:</span> {tracking.trackingNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Service:</span> {tracking.shipment.service}
                  </p>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Phone className="w-4 h-4" />
                  Call Carrier
                </Button>
              </CardContent>
            </Card>

            {/* Shipment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white mb-2">Package Info</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Packages:</span> {tracking.shipment.packageCount}</p>
                    <p><span className="font-medium">Weight:</span> {tracking.shipment.totalWeight}</p>
                    <p><span className="font-medium">Dimensions:</span> {tracking.shipment.dimensions}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white mb-2">Origin</h5>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-slate-900 dark:text-white">{tracking.shipment.origin.name}</p>
                    <p className="text-slate-600 dark:text-slate-400">{tracking.shipment.origin.address}</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {tracking.shipment.origin.city}, {tracking.shipment.origin.state} {tracking.shipment.origin.zipCode}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white mb-2">Destination</h5>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-slate-900 dark:text-white">{tracking.shipment.destination.name}</p>
                    <p className="text-slate-600 dark:text-slate-400">{tracking.shipment.destination.address}</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {tracking.shipment.destination.city}, {tracking.shipment.destination.state} {tracking.shipment.destination.zipCode}
                    </p>
                  </div>
                </div>

                {tracking.shipment.instructions && (
                  <>
                    <Separator />
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-white mb-2">Delivery Instructions</h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{tracking.shipment.instructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Report Issue
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Star className="w-4 h-4" />
                  Rate Experience
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Email Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}