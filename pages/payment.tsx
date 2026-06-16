import type { GetServerSideProps } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/router";
import { getAuthSession, loginRedirect } from "@/lib/page-auth";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getAuthSession(ctx);
  if (!session) return loginRedirect;
  return { props: {} };
};

export default function Payment() {
  const router = useRouter();
  const { eventId, amount: amountQuery, description: descQuery } = router.query;

  const [paymentDetails, setPaymentDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    description: typeof descQuery === "string" ? descQuery : "",
    date: "",
    amount: typeof amountQuery === "string" ? amountQuery : "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Lightweight client-side validation of the card form.
    if (
      !paymentDetails.cardholderName ||
      paymentDetails.cardNumber.replace(/\s/g, "").length < 12 ||
      !paymentDetails.expiryDate ||
      paymentDetails.cvv.length < 3
    ) {
      setError("Please fill in all card details correctly.");
      return;
    }
    if (!paymentDetails.amount || Number(paymentDetails.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: typeof eventId === "string" ? eventId : undefined,
          amount: Number(paymentDetails.amount),
          description: paymentDetails.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Payment failed");
        return;
      }
      setShowSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-200 to-gray-300">
      <Header />

      <main className="flex-grow container mx-auto p-8 flex justify-center items-center">
        <Card className="w-full max-w-lg bg-white rounded-lg shadow-xl">
          <CardHeader className="p-6 bg-gradient-to-r from-usmPurple to-gold text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Payment Summary</CardTitle>
            <p className="text-sm opacity-90">
              Simulated checkout. No real card is charged.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div>
              <label className="block text-gray-700 font-medium">
                Payment Description
              </label>
              <Input
                type="text"
                name="description"
                placeholder="Description (e.g., Event Ticket)"
                value={paymentDetails.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                Amount (RM)
              </label>
              <Input
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={paymentDetails.amount}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                Cardholder Name
              </label>
              <Input
                type="text"
                name="cardholderName"
                placeholder="Enter your name"
                value={paymentDetails.cardholderName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                Card Number
              </label>
              <Input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium">
                  Expiry Date
                </label>
                <Input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">CVV</label>
                <Input
                  type="password"
                  name="cvv"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>

          <div className="p-6">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-usmPurple to-gold text-white hover:from-purple-600 hover:to-yellow-500"
            >
              {submitting ? "Processing..." : "Submit Payment"}
            </Button>
          </div>
        </Card>
      </main>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-usmPurple mb-4">
            Payment Successful!
          </h2>
          <p className="text-gray-600">Payment Details:</p>
          <p className="text-gray-600">
            <strong>Description:</strong> {paymentDetails.description || "N/A"}
          </p>
          <p className="text-gray-600">
            <strong>Amount:</strong> RM {paymentDetails.amount || "N/A"}
          </p>
          <Button
            onClick={() => router.push("/home")}
            className="mt-4 w-full bg-gold text-usmPurple hover:bg-yellow-500"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
