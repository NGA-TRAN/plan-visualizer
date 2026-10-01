ArchiveUnion(operator_hint="not enough evidence"): MysteryMerge: policy=keep, description="quoted: comma, key=value"
  MysteryUnary: capacity=_, expr=[coalesce(@host@0, Utf8("a,b"))]
    MeadowScanExec: file_groups={2 groups: [[slice_1.dat], [slice_2.dat]]}, projection=[@host], output_ordering=[@host@0 ASC]
  MysteryLeaf: endpoint="https://example.invalid/data:0..1000"
  MysteryBranch: options=[a, b]
    EmptyExec
    EmptyExec
