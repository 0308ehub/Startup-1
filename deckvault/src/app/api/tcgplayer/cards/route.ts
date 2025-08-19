import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    // For now, return mock data to get the catalog working
    // TODO: Fix TCGPlayer API integration
    const mockCards = [
      {
        id: "21715",
        name: "4-Starred Ladybug of Doom",
        cleanName: "4 Starred Ladybug of Doom",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21715_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21716",
        name: "7 Colored Fish",
        cleanName: "7 Colored Fish",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21716_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21717",
        name: "7 Completed",
        cleanName: "7 Completed",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21717_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21718",
        name: "8-Claws Scorpion",
        cleanName: "8 Claws Scorpion",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21718_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21719",
        name: "A Cat of Ill Omen",
        cleanName: "A Cat of Ill Omen",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21719_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21720",
        name: "A Feint Plan",
        cleanName: "A Feint Plan",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21720_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21721",
        name: "A Legendary Ocean",
        cleanName: "A Legendary Ocean",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21721_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21722",
        name: "A Man with Wdjat",
        cleanName: "A Man with Wdjat",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21722_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21723",
        name: "A Wingbeat of Giant Dragon",
        cleanName: "A Wingbeat of Giant Dragon",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21723_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      },
      {
        id: "21724",
        name: "Adhesion Trap Hole",
        cleanName: "Adhesion Trap Hole",
        imageUrl: "https://tcgplayer-cdn.tcgplayer.com/product/21724_200w.jpg",
        categoryId: 2,
        groupId: 1,
        url: "",
        modifiedOn: new Date().toISOString(),
        imageCount: 1,
      }
    ];

    // Filter by search term if provided
    let filteredCards = mockCards;
    if (search) {
      filteredCards = mockCards.filter(card => 
        card.name.toLowerCase().includes(search.toLowerCase()) ||
        card.cleanName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedCards = filteredCards.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedCards,
      total: filteredCards.length,
      hasMore: endIndex < filteredCards.length,
    });

  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
