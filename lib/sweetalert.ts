import Swal, { type SweetAlertIcon } from "sweetalert2";

function themeOptions() {
  const styles = getComputedStyle(document.documentElement);
  return {
    background: styles.getPropertyValue("--surface").trim(),
    color: styles.getPropertyValue("--text").trim(),
    customClass: {
      popup: "app-swal-popup",
      confirmButton: "app-swal-confirm",
      cancelButton: "app-swal-cancel",
    },
    buttonsStyling: false,
  };
}

export function showAlert(type: SweetAlertIcon, title: string, message: string) {
  return Swal.fire({
    ...themeOptions(),
    icon: type,
    title,
    text: message,
    confirmButtonText: "OK",
  });
}

export async function confirmDelete(title: string, message: string) {
  const options = themeOptions();
  const result = await Swal.fire({
    ...options,
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    customClass: {
      ...options.customClass,
      confirmButton: "app-swal-confirm danger",
    },
  });
  return result.isConfirmed;
}

export function showTransactionAlert(type: SweetAlertIcon, message: string) {
  return showAlert(type, type === "success" ? "Success" : "Transaction error", message);
}

export function confirmTransactionDelete(message: string) {
  return confirmDelete("Delete transaction?", message);
}
