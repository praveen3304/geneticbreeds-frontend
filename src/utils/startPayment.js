export const startPayment = async ({
  token,
  paymentFor,
  planKey = null,
  boostDays = null,
  adId = null,
  onSuccess = null,
  onError = null,
}) => {
  try {
    const API_BASE = "https://genetic-breeds-backend.onrender.com/api";

    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("gb_user") || "{}");
      } catch {
        return {};
      }
    })();

    const createSessionResponse = await fetch(`${API_BASE}/payments/create-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentFor,
        planKey,
        boostDays,
        adId,
      }),
    });

    const createSessionData = await createSessionResponse.json();

    if (!createSessionResponse.ok) {
      throw new Error(createSessionData.message || "Failed to create payment session");
    }

    if (!createSessionData.success || !createSessionData.paymentSession) {
      throw new Error("Invalid payment session response");
    }

    const session = createSessionData.paymentSession;

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded");
    }

    const options = {
      key: session.key,
      amount: session.amount,
      currency: session.currency,
      order_id: session.orderId,
      name: "Genetic Breeds",
      description: `${paymentFor} payment`,
      handler: async function (response) {
        try {
          const verifyResponse = await fetch(`${API_BASE}/payments/verify/razorpay`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentId: session.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok) {
            throw new Error(verifyData.message || "Payment verification failed");
          }

          if (typeof onSuccess === "function") {
            await onSuccess(verifyData);
          } else {
            alert("Payment successful");
          }
        } catch (verifyError) {
          console.error("Payment verification error:", verifyError);

          if (typeof onError === "function") {
            onError(verifyError);
          } else {
            alert(verifyError.message || "Payment verification failed");
          }
        }
      },
      prefill: {
        name: storedUser.name || "",
        email: storedUser.email || "",
        contact: storedUser.phone || "",
      },
      notes: {
        paymentFor: paymentFor || "",
        planKey: planKey || "",
        boostDays: boostDays || "",
        adId: adId || "",
      },
      config: {
        display: {
          blocks: {
            preferred: {
              name: "Pay using",
              instruments: [
                {
                  method: "upi",
                },
                {
                  method: "card",
                },
                {
                  method: "netbanking",
                },
              ],
            },
          },
          sequence: ["block.preferred"],
          preferences: {
            show_default_blocks: false,
          },
        },
      },
      modal: {
        ondismiss: function () {
          if (typeof onError === "function") {
            onError(new Error("Payment popup closed"));
          }
        },
      },
      theme: {
        color: "#7a0016",
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  } catch (error) {
    console.error("startPayment error:", error);

    if (typeof onError === "function") {
      onError(error);
    } else {
      alert(error.message || "Payment failed");
    }
  }
};
