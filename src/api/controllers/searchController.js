const Listing = require('../models/listingModel');

exports.searchListings = async (req, res) => {
    try {
        const { 
            query,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        // Build the search query
        const searchQuery = {};

        if (query) {
            // Split search terms and escape special characters
            const searchTerms = query.split(' ')
                .filter(term => term.length > 0)
                .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

            searchQuery.$and = searchTerms.map(term => ({
                $or: [
                    // Exact match
                    { name: new RegExp(`\\b${term}\\b`, 'i') },
                    
                    // Partial match
                    { name: { $regex: term, $options: 'i' } },
                    { description: { $regex: term, $options: 'i' } },
                    
                    // Fuzzy match (allowing one character difference)
                    { 
                        $or: [
                            // One character might be different
                            { 
                                name: { 
                                    $regex: term.split('').map(char => 
                                        `[${char}${char.toUpperCase()}]?`
                                    ).join(''), 
                                    $options: 'i' 
                                }
                            },
                            // One character might be missing
                            { 
                                name: { 
                                    $regex: term.split('').map((char, i) => 
                                        `${term.slice(0, i)}[${char}]?${term.slice(i + 1)}`
                                    ).join('|'),
                                    $options: 'i' 
                                }
                            }
                        ]
                    }
                ]
            }));
        }

        // Category filter
        if (category) {
            searchQuery.category = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice) searchQuery.price.$gte = Number(minPrice);
            if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
        }

        // Sort options
        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        } else {
            sortOptions.createdAt = -1; // Default sort
        }

        // Execute query with pagination
        const listings = await Listing.find(searchQuery)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sellerId', 'name location rating');

        // Get total count for pagination
        const total = await Listing.countDocuments(searchQuery);

        // Calculate search relevance scores
        const scoredListings = query ? listings.map(listing => {
            const nameScore = calculateRelevanceScore(listing.name, query);
            const descScore = calculateRelevanceScore(listing.description, query);
            return {
                ...listing.toObject(),
                relevanceScore: (nameScore * 1.5) + descScore // Name matches weighted higher
            };
        }) : listings;

        // Sort by relevance if search query exists
        if (query) {
            scoredListings.sort((a, b) => b.relevanceScore - a.relevanceScore);
        }

        // Remove listings with zero relevance score
        const scoredListingsFinal = scoredListings.filter(listing => listing.relevanceScore !== 0);

        res.json({
            listings: scoredListingsFinal,
            metadata: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
                appliedFilters: {
                    query,
                    category,
                    priceRange: { min: minPrice, max: maxPrice }
                }
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Utility function for calculating search relevance
function calculateRelevanceScore(text, query) {
    if (!text || !query) return 0;

    const searchTerms = query.toLowerCase().split(' ');
    const textLower = text.toLowerCase();

    let score = 0;
    let totalMatches = 0;

    searchTerms.forEach(term => {
        if (textLower.includes(` ${term} `)) {
            score += 3;  // Exact word boundary match (high weight)
        } else if (textLower.includes(term)) {
            score += 1.5; // Partial match (medium weight)
        } else if (fuzzyMatch(textLower, term)) {
            score += 0.75; // Fuzzy match (low weight)
        }
        totalMatches++;
    });

    return score / totalMatches; // Normalize score
}

/*
Your method mainly allows skipping characters, but it doesn't handle:
Transpositions (e.g., "aple" for "apple")
Insertions (e.g., "appple" for "apple")
Substitutions (e.g., "appli" for "apple")
*/

// Utility function for calculating Levenshtein distance
function levenshteinDistance(s1, s2) {
    const dp = Array(s1.length + 1).fill(null).map(() => Array(s2.length + 1).fill(0));

    for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
    for (let j = 0; j <= s2.length; j++) dp[0][j] = j;

    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],    // Deletion
                    dp[i][j - 1],    // Insertion
                    dp[i - 1][j - 1] // Substitution
                );
            }
        }
    }
    return dp[s1.length][s2.length];
}

// Utility function for fuzzy matching
function fuzzyMatch(text, term) {
    const threshold = Math.floor(term.length / 3); // Allow up to 1/3 of term to be incorrect
    return levenshteinDistance(text, term) <= threshold;
}

