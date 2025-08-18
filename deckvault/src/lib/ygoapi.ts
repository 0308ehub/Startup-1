
export async function searchYugiohCards(searchTerm: string) {
  try {
    const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Check if data.data exists and is an array before mapping
    if (!data.data || !Array.isArray(data.data)) {
        return [];
    }
    return data.data.map((card: any) => ({
      id: card.id,
      name: card.name,
      imageUrl: card.card_images[0]?.image_url_small || card.card_images[0]?.image_url, // Prefer small, fallback to normal
    }));
  } catch (error) {
    console.error("Error fetching Yu-Gi-Oh! cards:", error);
    return [];
  }
}
