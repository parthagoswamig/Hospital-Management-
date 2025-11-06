// Minimal test to check what's failing
export default async (req: any, res: any) => {
  try {
    res.status(200).json({
      message: 'Basic handler works',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
