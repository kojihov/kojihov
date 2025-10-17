## Phase 3.0: Dependency Installation (Remediation)
```bash
$ pip install -r requirements.txt
Collecting pydantic (from -r requirements.txt (line 1))
  Downloading pydantic-2.12.2-py3-none-any.whl.metadata (85 kB)
Collecting pydantic-settings (from -r requirements.txt (line 2))
  Downloading pydantic_settings-2.11.0-py3-none-any.whl.metadata (3.4 kB)
Collecting pymongo (from -r requirements.txt (line 3))
  Downloading pymongo-4.15.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (22 kB)
Collecting motor (from -r requirements.txt (line 4))
  Downloading motor-3.7.1-py3-none-any.whl.metadata (21 kB)
Collecting httpx (from -r requirements.txt (line 5))
  Downloading httpx-0.28.1-py3-none-any.whl.metadata (7.1 kB)
Collecting aiogram (from -r requirements.txt (line 6))
  Downloading aiogram-3.22.0-py3-none-any.whl.metadata (7.7 kB)
Collecting annotated-types>=0.6.0 (from pydantic->-r requirements.txt (line 1))
  Downloading annotated_types-0.7.0-py3-none-any.whl.metadata (15 kB)
Collecting pydantic-core==2.41.4 (from pydantic->-r requirements.txt (line 1))
  Downloading pydantic_core-2.41.4-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (7.3 kB)
Requirement already satisfied: typing-extensions>=4.14.1 in /root/.pyenv/versions/3.11.12/lib/python3.11/site-packages (from pydantic->-r requirements.txt (line 1)) (4.15.0)
Collecting typing-inspection>=0.4.2 (from pydantic->-r requirements.txt (line 1))
  Downloading typing_inspection-0.4.2-py3-none-any.whl.metadata (2.6 kB)
Collecting python-dotenv>=0.21.0 (from pydantic-settings->-r requirements.txt (line 2))
  Downloading python_dotenv-1.1.1-py3-none-any.whl.metadata (24 kB)
Collecting dnspython<3.0.0,>=1.16.0 (from pymongo->-r requirements.txt (line 3))
  Downloading dnspython-2.8.0-py3-none-any.whl.metadata (5.7 kB)
Collecting anyio (from httpx->-r requirements.txt (line 5))
  Downloading anyio-4.11.0-py3-none-any.whl.metadata (4.1 kB)
Collecting certifi (from httpx->-r requirements.txt (line 5))
  Downloading certifi-2025.10.5-py3-none-any.whl.metadata (2.5 kB)
Collecting httpcore==1.* (from httpx->-r requirements.txt (line 5))
  Downloading httpcore-1.0.9-py3-none-any.whl.metadata (21 kB)
Collecting idna (from httpx->-r requirements.txt (line 5))
  Downloading idna-3.11-py3-none-any.whl.metadata (8.4 kB)
Collecting h11>=0.16 (from httpcore==1.*->httpx->-r requirements.txt (line 5))
  Downloading h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
Collecting aiofiles<24.2,>=23.2.1 (from aiogram->-r requirements.txt (line 6))
  Downloading aiofiles-24.1.0-py3-none-any.whl.metadata (10 kB)
Collecting aiohttp<3.13,>=3.9.0 (from aiogram->-r requirements.txt (line 6))
  Downloading aiohttp-3.12.15-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (7.7 kB)
Collecting magic-filter<1.1,>=1.0.12 (from aiogram->-r requirements.txt (line 6))
  Downloading magic_filter-1.0.12-py3-none-any.whl.metadata (1.5 kB)
Collecting pydantic (from -r requirements.txt (line 1))
  Downloading pydantic-2.11.10-py3-none-any.whl.metadata (68 kB)
Collecting pydantic-core==2.33.2 (from pydantic->-r requirements.txt (line 1))
  Downloading pydantic_core-2.33.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (6.8 kB)
Collecting aiohappyeyeballs>=2.5.0 (from aiohttp<3.13,>=3.9.0->aiogram->-r requirements.txt (line 6))
  Downloading aiohappyeyeballs-2.6.1-py3-none-any.whl.metadata (5.9 kB)
Collecting aiosignal>=1.4.0 (from aiohttp<3.13,>=3.9.0->aiogram->-r requirements.txt (line 6))
  Downloading aiosignal-1.4.0-py3-none-any.whl.metadata (3.7 kB)
Collecting attrs>=17.3.0 (from aiohttp<3.13,>=3.9.0->aiogram->-r requirements.txt (line 6))
  Downloading attrs-25.4.0-py3-none-any.whl.metadata (10 kB)
Collecting frozenlist>=1.1.1 (from aiohttp<3.13,>=3.9.0->aiogram->-r requirements.txt (line 6))
  Downloading frozenlist-1.8.0-cp311-cp311-manylinux1_x86_64.manylinux_2_28_x86_64.manylinux_2_5_x86_64.whl.metadata (20 kB)
Collecting multidict<7.0,>=4.5 (from aiohttp<3.13,>=3.9.0->aiogram->-r requirements.txt (line 6))
  Downloading multidict-6.7.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (5.3 kB)
Collecting propcache>=0.2.0 (from aiohttp<3.13,>=3.9.0->aiogram->-r requirements.txt (line 6))
  Downloading propcache-0.4.1-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (13 kB)
Collecting yarl<2.0,>=1.17.0 (from aiohttp<3.13,>=3.9.0->aiogram->-r requirements.txt (line 6))
  Downloading yarl-1.22.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (75 kB)
Collecting sniffio>=1.1 (from anyio->httpx->-r requirements.txt (line 5))
  Downloading sniffio-1.3.1-py3-none-any.whl.metadata (3.9 kB)
Downloading pydantic_settings-2.11.0-py3-none-any.whl (48 kB)
Downloading pymongo-4.15.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (1.5 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.5/1.5 MB 14.9 MB/s  0:00:00
Downloading dnspython-2.8.0-py3-none-any.whl (331 kB)
Downloading motor-3.7.1-py3-none-any.whl (74 kB)
Downloading httpx-0.28.1-py3-none-any.whl (73 kB)
Downloading httpcore-1.0.9-py3-none-any.whl (78 kB)
Downloading aiogram-3.22.0-py3-none-any.whl (698 kB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 698.2/698.2 kB 34.9 MB/s  0:00:00
Downloading pydantic-2.11.10-py3-none-any.whl (444 kB)
Downloading pydantic_core-2.33.2-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (2.0 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.0/2.0 MB 42.2 MB/s  0:00:00
Downloading aiofiles-24.1.0-py3-none-any.whl (15 kB)
Downloading aiohttp-3.12.15-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (1.7 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.7/1.7 MB 39.6 MB/s  0:00:00
Downloading magic_filter-1.0.12-py3-none-any.whl (11 kB)
Downloading multidict-6.7.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (246 kB)
Downloading yarl-1.22.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (365 kB)
Downloading aiohappyeyeballs-2.6.1-py3-none-any.whl (15 kB)
Downloading aiosignal-1.4.0-py3-none-any.whl (7.5 kB)
Downloading annotated_types-0.7.0-py3-none-any.whl (13 kB)
Downloading attrs-25.4.0-py3-none-any.whl (67 kB)
Downloading certifi-2025.10.5-py3-none-any.whl (163 kB)
Downloading frozenlist-1.8.0-cp311-cp311-manylinux1_x86_64.manylinux_2_28_x86_64.manylinux_2_5_x86_64.whl (231 kB)
Downloading h11-0.16.0-py3-none-any.whl (37 kB)
Downloading idna-3.11-py3-none-any.whl (71 kB)
Downloading propcache-0.4.1-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (210 kB)
Downloading python_dotenv-1.1.1-py3-none-any.whl (20 kB)
Downloading typing_inspection-0.4.2-py3-none-any.whl (14 kB)
Downloading anyio-4.11.0-py3-none-any.whl (109 kB)
Downloading sniffio-1.3.1-py3-none-any.whl (10 kB)
Installing collected packages: typing-inspection, sniffio, python-dotenv, pydantic-core, propcache, multidict, magic-filter, idna, h11, frozenlist, dnspython, certifi, attrs, annotated-types, aiohappyeyeballs, aiofiles, yarl, pymongo, pydantic, httpcore, anyio, aiosignal, pydantic-settings, motor, httpx, aiohttp, aiogram
   ━━━━━━━━━━━━━━━━━━━━━━━━━━╸━━━━━━━━━━━━━ 18/27 [pydantic]
Successfully installed aiofiles-24.1.0 aiogram-3.22.0 aiohappyeyeballs-2.6.1 aiohttp-3.12.15 aiosignal-1.4.0 annotated-types-0.7.0 anyio-4.11.0 attrs-25.4.0 certifi-2025.10.5 dnspython-2.8.0 frozenlist-1.8.0 h11-0.16.0 httpcore-1.0.9 httpx-0.28.1 idna-3.11 magic-filter-1.0.12 motor-3.7.1 multidict-6.7.0 propcache-0.4.1 pydantic-2.11.10 pydantic-core-2.33.2 pydantic-settings-2.11.0 pymongo-4.15.3 python-dotenv-1.1.1 sniffio-1.3.1 typing-inspection-0.4.2 yarl-1.22.0
WARNING: Running pip as the 'root' user can result in broken permissions and conflicting behaviour with the system package manager, possibly rendering your system unusable. It is recommended to use a virtual environment instead: https://pip.pypa.io/warnings/venv. Use the --root-user-action option if you know what you are doing and want to suppress this warning.
```

## Phase 3.1: Analysis Core Unit Test
### Initial Attempt
```bash
$ python tests/test_analysis_core.py
Traceback (most recent call last):
  File "/workspace/vitador/tests/test_analysis_core.py", line 10, in <module>
    from analysis.engine import AnalysisEngine  # noqa: E402
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/workspace/vitador/analysis/engine.py", line 5, in <module>
    from core.logger import log
  File "/workspace/vitador/core/logger.py", line 5, in <module>
    from .config import settings
  File "/workspace/vitador/core/config.py", line 2, in <module>
    from pydantic_settings import BaseSettings, SettingsConfigDict
ModuleNotFoundError: No module named 'pydantic_settings'
```

### Successful Execution
```bash
$ python tests/test_analysis_core.py
--- Running Analysis Engine Test ---
2025-10-16 00:40:44,432 - ManusAnalytics - INFO - AnalysisEngine initialized with 2 heuristics.
2025-10-16 00:40:44,433 - ManusAnalytics - INFO - Running analysis for match: Liverpool FC vs Swansea City
2025-10-16 00:40:44,433 - ManusAnalytics - INFO - Heuristic 'Historical Head-to-Head' verdict: Home Win (Confidence: 0.70)
2025-10-16 00:40:44,434 - ManusAnalytics - INFO - Heuristic 'Current Form Snapshot' verdict: Home Win (Confidence: 0.60)
✅ AnalysisEngine test passed.
.
----------------------------------------------------------------------
Ran 1 test in 0.004s

OK
```
