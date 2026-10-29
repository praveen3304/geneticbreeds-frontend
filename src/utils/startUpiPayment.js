import { upiQrDataUrl } from "./upiQr";

const API_BASE = "https://genetic-breeds-backend.onrender.com/api";
const THEME = "#7a0016";

const make = (tag, style = {}, text = "") => {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  if (text) node.textContent = text;
  return node;
};

const formatAmount = (amount) =>
  `\u20B9${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const showUpiModal = ({ token, upi, paymentFor, onSubmitted, doneMessage }) =>
  new Promise((resolve) => {
    const overlay = make("div", {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      background: "rgba(0,0,0,0.55)",
      zIndex: "10000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    });

    const card = make("div", {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "16px",
      width: "100%",
      maxWidth: "380px",
      maxHeight: "96vh",
      overflowY: "auto",
      fontFamily: "sans-serif",
      color: "#111827",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    });

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const closeModal = (result) => {
      overlay.remove();
      resolve(result);
    };

    const buttonStyle = (primary) => ({
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: primary ? "none" : `1.5px solid ${THEME}`,
      background: primary ? THEME : "transparent",
      color: primary ? "#ffffff" : THEME,
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      marginTop: "10px",
      textAlign: "center",
      textDecoration: "none",
      display: "block",
      boxSizing: "border-box",
    });

    const renderDone = (data, problem = "") => {
      card.textContent = "";
      card.appendChild(
        make("h3", { margin: "0 0 10px", fontSize: "18px" }, problem ? "Payment received" : "Payment submitted")
      );
      const doneText = problem
        ? `We received your transaction ID, but something went wrong: ${problem} Please contact us with the reference below and we will fix it.`
        : doneMessage
        ? doneMessage
        : paymentFor === "membership"
        ? "Thank you. Your plan will be activated after we verify your payment. After that, you can post ads using your plan credits."
        : paymentFor === "boost"
        ? "Thank you. Your boost will start after we verify your payment."
        : paymentFor === "ad"
        ? "Thank you. Your ad has been saved and will go live after we verify your payment."
        : "Thank you. We will verify your payment and activate it shortly.";
      card.appendChild(
        make(
          "p",
          { margin: "0 0 6px", fontSize: "14px", lineHeight: "1.5", color: "#374151" },
          doneText
        )
      );
      card.appendChild(
        make(
          "p",
          { margin: "0", fontSize: "12px", color: "#6b7280" },
          `Reference: ${upi.reference}`
        )
      );
      const done = make("button", buttonStyle(true), "Close");
      done.onclick = () => closeModal({ status: "submitted", data });
      card.appendChild(done);
    };

    const renderForm = () => {
      card.textContent = "";

      const compact = typeof window !== "undefined" && window.innerWidth < 600;
      const qrSize = compact ? 120 : 150;

      // Title and amount on one line
      const header = make("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: "8px",
      });
      header.appendChild(make("h3", { margin: "0", fontSize: "17px" }, "Pay by UPI"));
      header.appendChild(
        make("div", { fontSize: "24px", fontWeight: "800", color: THEME }, formatAmount(upi.amount))
      );
      card.appendChild(header);

      if (Number(upi.walletUsed) > 0) {
        card.appendChild(
          make(
            "div",
            {
              fontSize: "12px",
              color: "#166534",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              padding: "6px 8px",
              borderRadius: "8px",
              marginBottom: "8px",
            },
            "Wallet credit of " + formatAmount(upi.walletUsed) + " has been applied. Pay the amount shown above by UPI."
          )
        );
      }

      // Small QR code
      const qrWrap = make("div", {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "0 0 8px",
      });
      try {
        const qrImg = make("img", {
          width: `${qrSize}px`,
          height: `${qrSize}px`,
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
        });
        qrImg.alt = "UPI QR code";
        qrImg.src = upiQrDataUrl(upi.upiLink);
        qrWrap.appendChild(qrImg);
        qrWrap.appendChild(
          make(
            "div",
            { fontSize: "11px", color: "#6b7280", marginTop: "4px", textAlign: "center" },
            "Scan with any UPI app (GPay, PhonePe, Paytm)"
          )
        );
      } catch (qrError) {
        console.error("QR code error:", qrError);
      }
      card.appendChild(qrWrap);

      // Open the UPI app (phones)
      const payLink = make(
        "a",
        { ...buttonStyle(true), marginTop: "0", padding: "10px" },
        "Open UPI app to pay"
      );
      payLink.href = upi.upiLink;
      card.appendChild(payLink);

      // UPI ID as a compact fallback
      card.appendChild(
        make("div", { fontSize: "11px", color: "#6b7280", margin: "10px 0 3px" }, "Or pay to this UPI ID")
      );
      const idRow = make("div", { display: "flex", gap: "8px", alignItems: "center" });
      idRow.appendChild(
        make(
          "div",
          {
            flex: "1",
            padding: "8px 10px",
            background: "#f3f4f6",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            wordBreak: "break-all",
          },
          upi.upiId
        )
      );
      const copyBtn = make(
        "button",
        {
          padding: "8px 10px",
          borderRadius: "8px",
          border: `1.5px solid ${THEME}`,
          background: "transparent",
          color: THEME,
          fontWeight: "700",
          fontSize: "12px",
          cursor: "pointer",
        },
        "Copy"
      );
      copyBtn.onclick = async () => {
        const ok = await copyText(upi.upiId);
        copyBtn.textContent = ok ? "Copied" : "Copy failed";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      };
      idRow.appendChild(copyBtn);
      card.appendChild(idRow);

      // Transaction ID right below, visible without scrolling
      card.appendChild(
        make(
          "div",
          { fontSize: "13px", fontWeight: "700", margin: "12px 0 5px" },
          "After paying, enter the UPI transaction ID"
        )
      );
      const input = make("input", {
        width: "100%",
        boxSizing: "border-box",
        padding: "10px",
        borderRadius: "8px",
        border: "1.5px solid #d1d5db",
        fontSize: "15px",
        letterSpacing: "1px",
      });
      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = 12;
      input.placeholder = "12-digit UPI transaction ID";
      input.oninput = () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 12);
      };
      card.appendChild(input);

      const errorBox = make("div", {
        color: "#b91c1c",
        fontSize: "12px",
        marginTop: "4px",
        minHeight: "14px",
      });
      card.appendChild(errorBox);

      const submit = make(
        "button",
        { ...buttonStyle(true), marginTop: "4px", padding: "11px" },
        "Submit transaction ID"
      );
      submit.onclick = async () => {
        errorBox.textContent = "";
        const utr = input.value.trim();
        if (!/^\d{12}$/.test(utr)) {
          errorBox.textContent = "Enter the 12-digit UPI transaction ID.";
          return;
        }
        submit.disabled = true;
        submit.textContent = "Submitting...";
        try {
          const response = await fetch(`${API_BASE}/payments/upi/submit-utr`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ paymentId: upi.paymentId, utr }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || data.error || "Could not submit the transaction ID");
          }
          let problem = "";
          if (typeof onSubmitted === "function") {
            submit.textContent = "Finishing...";
            try {
              await onSubmitted(data);
            } catch (callbackError) {
              console.error("onSubmitted error:", callbackError);
              problem = callbackError?.message || "Please try again.";
            }
          }
          renderDone(data, problem);
        } catch (error) {
          errorBox.textContent = error.message || "Something went wrong. Try again.";
          submit.disabled = false;
          submit.textContent = "Submit transaction ID";
        }
      };
      card.appendChild(submit);

      // One short note below
      card.appendChild(
        make(
          "p",
          { fontSize: "11px", color: "#6b7280", margin: "8px 0 0", lineHeight: "1.4" },
          `On a phone, tap the button above; on a computer, scan the QR with your phone. The payee name shown will be the owner of Genetic Breeds. Payment note (if asked): ${upi.reference}. Keep this window open until you submit the transaction ID.`
        )
      );

      const cancel = make(
        "button",
        { ...buttonStyle(false), marginTop: "8px", padding: "9px" },
        "Cancel"
      );
      cancel.onclick = () => closeModal({ status: "cancelled" });
      card.appendChild(cancel);
    };

    renderForm();
  });

export const startUpiPayment = async ({
  token,
  paymentFor,
  planKey = null,
  boostDays = null,
  adId = null,
  useWallet = false,
  onSubmitted = null,
  doneMessage = null,
  onError = null,
}) => {
  // Note: the caller's onError may throw on purpose (PostAd.js does), so it is
  // not wrapped in try/catch here. The throw reaches the caller's await.
  const fail = (error) => {
    if (typeof onError === "function") {
      onError(error);
    } else {
      alert(error.message || "Payment failed");
    }
  };

  let outcome;

  try {
    const response = await fetch(`${API_BASE}/payments/upi/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentFor, planKey, boostDays, adId, useWallet }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to start UPI payment");
    }
    if (!data.success || !data.upiPayment) {
      throw new Error("Invalid UPI payment response");
    }

    outcome = await showUpiModal({
      token,
      upi: data.upiPayment,
      paymentFor,
      onSubmitted,
      doneMessage,
    });
  } catch (error) {
    console.error("startUpiPayment error:", error);
    fail(error);
    return;
  }

  if (outcome && outcome.status === "submitted") {
    // onSubmitted already ran inside the popup, right after the transaction ID was accepted.
    return;
  }

  fail(new Error("Payment cancelled"));
};
