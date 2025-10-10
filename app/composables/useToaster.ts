export function useToaster() {
  const toast = useToast();
  function error(message: string, option?: { title: string }) {
    toast.add({
      title: option?.title,
      description: message,
      icon: 'ic:twotone-error',
      color: 'error',
    });
  }

  return { error };
}
