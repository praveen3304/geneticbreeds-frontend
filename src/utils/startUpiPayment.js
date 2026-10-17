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

const showUpiModal = ({ token, upi, paymentFor }) =>
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
      padding: "22px",
      width: "100%",
      maxWidth: "380px",
      maxHeight: "92vh",
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

    const renderDone = (data) => {
      card.textContent = "";
      card.appendChild(make("h3", { margin: "0 0 10px", fontSize: "18px" }, "Payment submitted"));
      const doneText =
        paymentFor === "membership"
          ? "Thank you. Your plan will be activated after we verify your payment. After that, you can post ads using your plan credits."
          : paymentFor === "boost"
          ? "Thank you. Your boost will start after we verify your payment."
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

      card.appendChild(make("h3", { margin: "0 0 4px", fontSize: "18px" }, "Pay by UPI"));
      card.appendChild(
        make("div", { fontSize: "26px", fontWeight: "800", color: THEME, margin: "4px 0 12px" }, formatAmount(upi.amount))
      );

      card.appendChild(make("div", { fontSize: "12px", color: "#6b7280" }, "Pay to this UPI ID"));
      const idRow = make("div", {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        margin: "4px 0 8px",
      });
      idRow.appendChild(
        make(
          "div",
          {
            flex: "1",
            padding: "10px",
            background: "#f3f4f6",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "700",
            wordBreak: "break-all",
          },
          upi.upiId
        )
      );
      const copyBtn = make(
        "button",
        {
          padding: "10px 12px",
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

      const payLink = make("a", buttonStyle(true), "Open UPI app to pay");
      payLink.href = upi.upiLink;
      card.appendChild(payLink);

      card.appendChild(
        make(
          "p",
          { fontSize: "12px", color: "#6b7280", margin: "10px 0 0", lineHeight: "1.5" },
          "On a computer? Pay from your phone using the UPI ID above. The name shown in your UPI app will be the owner of Genetic Breeds."
        )
      );
      card.appendChild(
        make(
          "p",
          { fontSize: "12px", color: "#6b7280", margin: "6px 0 0" },
          `If your app allows a note, write: ${upi.reference}`
        )
      );

      card.appendChild(
        make(
          "div",
          { fontSize: "13px", fontWeight: "700", margin: "16px 0 6px" },
          "After paying, enter the UPI transaction ID"
        )
      );
      const input = make("input", {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px",
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
        marginTop: "6px",
        minHeight: "16px",
      });
      card.appendChild(errorBox);

      const submit = make("button", buttonStyle(true), "Submit transaction ID");
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
          renderDone(data);
        } catch (error) {
          errorBox.textContent = error.message || "Something went wrong. Try again.";
          submit.disabled = false;
          submit.textContent = "Submit transaction ID";
        }
      };
      card.appendChild(submit);

      card.appendChild(
        make(
          "p",
          { fontSize: "11px", color: "#9ca3af", margin: "8px 0 0", textAlign: "center" },
          "Keep this window open until you have submitted the transaction ID."
        )
      );

      const cancel = make("button", buttonStyle(false), "Cancel");
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
  onSubmitted = null,
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

  if (paymentFor === "ad") {
    fail(
      new Error(
        "Paying for a single ad by UPI is not available yet. Please buy a membership plan."
      )
    );
    return;
  }

  let outcome;

  try {
    const response = await fetch(`${API_BASE}/payments/upi/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentFor, planKey, boostDays, adId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to start UPI payment");
    }
    if (!data.success || !data.upiPayment) {
      throw new Error("Invalid UPI payment response");
    }

    outcome = await showUpiModal({ token, upi: data.upiPayment, paymentFor });
  } catch (error) {
    console.error("startUpiPayment error:", error);
    fail(error);
    return;
  }

  if (outcome && outcome.status === "submitted") {
    if (typeof onSubmitted === "function") {
      await onSubmitted(outcome.data);
    }
    return;
  }

  fail(new Error("Payment cancelled"));
};
