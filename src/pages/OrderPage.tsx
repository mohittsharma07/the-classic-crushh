import { useState } from "react";
import { useOrder } from "../context/OrderContext";
import { useData } from "../context/DataContext";

type PlacedOrder = {
  id: string;
};

const CAMPUS_CENTER = {
  latitude: 26.5019583,
  longitude: 80.2657141,
};

// IMPORTANT: This is an approximate radius, not an official campus boundary.
const CAMPUS_RADIUS_METERS = 3000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

function getDistanceInMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadius = 6371000;

  const dLat = toRadians(latitude2 - latitude1);
  const dLon = toRadians(longitude2 - longitude1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(dLon / 2) ** 2;

  const safeA = Math.min(1, Math.max(0, a));

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA))
  );
}

export default function OrderPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalCount,
    totalAmount,
    clearOrder,
  } = useOrder();

  const { addOrder } = useData();

  const [currentStep, setCurrentStep] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway" | "Delivery">(
    "Dine-in"
  );
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pay at Counter");
  const [locationError, setLocationError] = useState("");
  const [locationChecking, setLocationChecking] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const grandTotal = Number(totalAmount) || 0;

  const handleConfirmOrder = async () => {
    setLocationError("");

    if (items.length === 0) {
      setLocationError("Your cart is empty. Please add items before ordering.");
      setCurrentStep(1);
      return;
    }

    if (!customerName.trim()) {
      setLocationError("Please enter your full name.");
      setCurrentStep(2);
      return;
    }

    const cleanedPhone = customerPhone.replace(/\D/g, "");

    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      setLocationError("Please enter a valid mobile number.");
      setCurrentStep(2);
      return;
    }

    if (orderType === "Dine-in" && !tableNumber.trim()) {
      setLocationError("Please enter your table number.");
      setCurrentStep(2);
      return;
    }

    if (orderType === "Delivery" && !deliveryAddress.trim()) {
      setLocationError("Please enter your delivery address.");
      setCurrentStep(2);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError(
        "Location access is not supported by your browser. Please use a supported browser and try again."
      );
      return;
    }

    setLocationChecking(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            !Number.isFinite(accuracy) ||
            accuracy > 100
          ) {
            setLocationError(
              "We couldn't verify your location accurately. Please enable GPS and try again."
            );
            return;
          }

          const distance = getDistanceInMeters(
            CAMPUS_CENTER.latitude,
            CAMPUS_CENTER.longitude,
            latitude,
            longitude
          );

          if (distance > CAMPUS_RADIUS_METERS) {
            setLocationError(
              "Oops! You're Outside Our Campus — Orders are available only within Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur. Please visit our campus and try again."
            );
            return;
          }

          const order = await addOrder({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            items: items.map(({ item, quantity }) => ({
              id: item.id,
              name: item.name,
              quantity,
              price: item.price,
            })),
            totalAmount: grandTotal,
            status: "Pending",
            orderType,
            note:
              [
                specialRequest.trim(),
                orderType === "Dine-in" && tableNumber.trim()
                  ? `Table: ${tableNumber.trim()}`
                  : "",
                orderType === "Delivery" && deliveryAddress.trim()
                  ? `Address: ${deliveryAddress.trim()}`
                  : "",
                `Payment method: ${paymentMethod}`,
              ]
                .filter(Boolean)
                .join(" | ") || undefined,
          });

          setPlacedOrder({ id: String(order.id) });
          clearOrder();
          setCurrentStep(4);
        } catch (error) {
          console.error("Order placement error:", error);
          setLocationError(
            "We couldn't process your order. Please try again."
          );
        } finally {
          setLocationChecking(false);
        }
      },
      (error) => {
        setLocationChecking(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission is required to place an order. Please allow location access in your browser settings and try again."
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationError(
            "Location verification timed out. Please check your GPS signal and try again."
          );
        } else {
          setLocationError(
            "We couldn't access your location. Please enable location services and try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const formatPrice = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="min-h-screen bg-[#fffcf6] px-4 py-8 text-[#092d20] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#b9a064]">
            The Classic Crush
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">Your Order</h1>
          <p className="mt-2 text-sm text-gray-600">
            Freshly prepared, just the way you like it.
          </p>
        </header>

        <nav
          aria-label="Checkout progress"
          className="mb-8 grid grid-cols-4 gap-2"
        >
          {["Cart", "Details", "Payment", "Confirm"].map((step, index) => {
            const stepNumber = index + 1;
            const active = currentStep >= stepNumber;

            return (
              <div
                key={step}
                className={`rounded-xl px-2 py-3 text-center text-xs font-semibold sm:text-sm ${
                  active
                    ? "bg-[#103b29] text-white"
                    : "bg-white text-gray-500 ring-1 ring-gray-200"
                }`}
              >
                <span className="mr-1">{stepNumber}.</span>
                {step}
              </div>
            );
          })}
        </nav>

        {locationError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {locationError}
          </div>
        )}

        {currentStep === 1 && (
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
            <h2 className="mb-5 text-xl font-bold">Your cart</h2>

            {items.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-600">Your cart is empty.</p>
                <p className="mt-2 text-sm text-gray-500">
                  Go back to the menu and add your favourite items.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatPrice(Number(item.price) || 0)} each
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center gap-3 rounded-full border border-gray-200 px-3 py-1">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, quantity - 1))
                          }
                          disabled={quantity <= 1}
                          className="px-1 text-lg disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="min-w-4 text-center">{quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(item.id, quantity + 1)
                          }
                          className="px-1 text-lg"
                        >
                          +
                        </button>
                      </div>

                      <span className="min-w-20 text-right font-semibold">
                        {formatPrice((Number(item.price) || 0) * quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
              <div>
                <p className="text-sm text-gray-500">
                  {totalCount} item{totalCount === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-xl font-bold">
                  {formatPrice(grandTotal)}
                </p>
              </div>

              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => {
                  setLocationError("");
                  setCurrentStep(2);
                }}
                className="rounded-xl bg-[#103b29] px-6 py-3 font-semibold text-white transition hover:bg-[#092d20] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
            <h2 className="mb-5 text-xl font-bold">Customer details</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Full name *
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  autoComplete="name"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#103b29] focus:ring-2 focus:ring-[#103b29]/10"
                  placeholder="Enter your full name"
                />
              </label>

              <label className="block text-sm font-medium">
                Mobile number *
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  autoComplete="tel"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#103b29] focus:ring-2 focus:ring-[#103b29]/10"
                  placeholder="Enter mobile number"
                />
              </label>

              <label className="block text-sm font-medium sm:col-span-2">
                Order type *
                <select
                  value={orderType}
                  onChange={(event) =>
                    setOrderType(
                      event.target.value as "Dine-in" | "Takeaway" | "Delivery"
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#103b29]"
                >
                  <option value="Dine-in">Dine-in</option>
                  <option value="Takeaway">Takeaway</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </label>

              {orderType === "Dine-in" && (
                <label className="block text-sm font-medium sm:col-span-2">
                  Table number *
                  <input
                    value={tableNumber}
                    onChange={(event) => setTableNumber(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#103b29]"
                    placeholder="Enter your table number"
                  />
                </label>
              )}

              {orderType === "Delivery" && (
                <label className="block text-sm font-medium sm:col-span-2">
                  Delivery address *
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#103b29]"
                    placeholder="Enter your address inside the campus"
                  />
                </label>
              )}

              <label className="block text-sm font-medium sm:col-span-2">
                Special request (optional)
                <textarea
                  value={specialRequest}
                  onChange={(event) => setSpecialRequest(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#103b29]"
                  placeholder="Any instructions for your order?"
                />
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setLocationError("");
                  setCurrentStep(1);
                }}
                className="rounded-xl border border-gray-200 px-6 py-3 font-semibold hover:bg-gray-50"
              >
                Back to cart
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocationError("");

                  if (!customerName.trim()) {
                    setLocationError("Please enter your full name.");
                    return;
                  }

                  const phoneLength = customerPhone.replace(/\D/g, "").length;

                  if (phoneLength < 10 || phoneLength > 15) {
                    setLocationError("Please enter a valid mobile number.");
                    return;
                  }

                  if (orderType === "Dine-in" && !tableNumber.trim()) {
                    setLocationError("Please enter your table number.");
                    return;
                  }

                  if (orderType === "Delivery" && !deliveryAddress.trim()) {
                    setLocationError("Please enter your delivery address.");
                    return;
                  }

                  setCurrentStep(3);
                }}
                className="rounded-xl bg-[#103b29] px-6 py-3 font-semibold text-white hover:bg-[#092d20]"
              >
                Continue to payment
              </button>
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
            <h2 className="mb-2 text-xl font-bold">Payment preference</h2>
            <p className="mb-6 text-sm text-gray-500">
              Choose how you intend to pay. Online payment is not processed by
              this page.
            </p>

            <div className="space-y-3">
              {["Pay at Counter", "Cash", "UPI at Counter"].map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                    paymentMethod === method
                      ? "border-[#103b29] bg-[#103b29]/5"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-[#103b29]"
                  />
                  <span className="font-medium">{method}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-[#f4ebdd] p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span>Items ({totalCount})</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              <div className="mt-3 flex justify-between gap-4 border-t border-[#d4bd85]/50 pt-3 font-bold">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setLocationError("");
                  setCurrentStep(2);
                }}
                className="rounded-xl border border-gray-200 px-6 py-3 font-semibold hover:bg-gray-50"
              >
                Back
              </button>

              <button
                type="button"
                disabled={locationChecking || items.length === 0}
                onClick={handleConfirmOrder}
                className="rounded-xl bg-[#103b29] px-6 py-3 font-semibold text-white hover:bg-[#092d20] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locationChecking ? "Verifying location..." : "Place order"}
              </button>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              Location access is required. Orders are intended only for the
              CSJMU campus in Kanpur.
            </p>
          </section>
        )}

        {currentStep === 4 && (
          <section className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-800">
              ✓
            </div>

            <h2 className="text-2xl font-bold">Thank you for your order!</h2>
            <p className="mt-3 text-gray-600">
              Your order has been recorded in the app.
            </p>

            {placedOrder && (
              <p className="mt-4 inline-block rounded-lg bg-[#f4ebdd] px-4 py-2 font-semibold">
                Order ID: #{placedOrder.id}
              </p>
            )}

            <p className="mt-4 text-sm text-gray-500">
              Payment preference: {paymentMethod}
            </p>

            <button
              type="button"
              onClick={() => {
                setCustomerName("");
                setCustomerPhone("");
                setOrderType("Dine-in");
                setTableNumber("");
                setDeliveryAddress("");
                setSpecialRequest("");
                setPaymentMethod("Pay at Counter");
                setLocationError("");
                setPlacedOrder(null);
                setCurrentStep(1);
              }}
              className="mt-7 rounded-xl bg-[#103b29] px-6 py-3 font-semibold text-white hover:bg-[#092d20]"
            >
              Back to menu
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
